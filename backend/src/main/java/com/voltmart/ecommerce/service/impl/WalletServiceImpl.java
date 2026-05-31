package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.wallet.*;
import com.voltmart.ecommerce.entity.Order;
import com.voltmart.ecommerce.entity.User;
import com.voltmart.ecommerce.entity.WalletCoupon;
import com.voltmart.ecommerce.entity.WalletCouponRedemption;
import com.voltmart.ecommerce.entity.WalletTransaction;
import com.voltmart.ecommerce.entity.enums.WalletCouponType;
import com.voltmart.ecommerce.entity.enums.WalletTransactionType;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.repository.OrderRepository;
import com.voltmart.ecommerce.repository.UserRepository;
import com.voltmart.ecommerce.repository.WalletCouponRepository;
import com.voltmart.ecommerce.repository.WalletCouponRedemptionRepository;
import com.voltmart.ecommerce.repository.WalletTransactionRepository;
import com.voltmart.ecommerce.service.CurrentUserService;
import com.voltmart.ecommerce.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final WalletCouponRepository walletCouponRepository;
    private final WalletCouponRedemptionRepository walletCouponRedemptionRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Override
    @Transactional
    public WalletResponse getCurrentUserWallet() {
        applyDueWalletCredits();
        User user = currentUserService.getCurrentUser();
        return buildWalletResponse(user);
    }

    @Override
    @Transactional
    public WalletResponse redeemWalletTopupCode(String code) {
        applyDueWalletCredits();
        User user = currentUserService.getCurrentUser();
        WalletCoupon coupon = walletCouponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon code not found"));
        if (!coupon.isActive()) {
            throw new BadRequestException("This coupon code is inactive");
        }
        if (coupon.getType() != WalletCouponType.WALLET_TOPUP) {
            throw new BadRequestException("This code can only be used during checkout");
        }
        if (!isAssignedToUser(coupon, user)) {
            throw new BadRequestException("This coupon code is not assigned to your account");
        }

        consumeCouponForUser(coupon, user);
        creditWallet(user, coupon.getAmount(), "Wallet top-up via admin code", coupon.getCode());
        return buildWalletResponse(user);
    }

    @Override
    public List<WalletCouponResponse> getAllCoupons() {
        return walletCouponRepository.findAll().stream()
                .map(this::toCouponResponse)
                .toList();
    }

    @Override
    public List<WalletCouponResponse> getCustomerCheckoutCoupons() {
        User user = currentUserService.getCurrentUser();
        String userEmail = user.getEmail() == null ? null : user.getEmail().trim().toLowerCase();
        return walletCouponRepository.findAll().stream()
                .filter(WalletCoupon::isActive)
                .filter(coupon -> coupon.getType() == WalletCouponType.ORDER_CASHBACK)
                .filter(coupon -> {
                    String assigned = coupon.getAssignedCustomerEmails();
                    if (assigned == null || assigned.isBlank()) {
                        return true;
                    }
                    if (userEmail == null || userEmail.isBlank()) {
                        return false;
                    }
                    return java.util.Arrays.stream(assigned.split(","))
                            .map(String::trim)
                            .anyMatch(email -> email.equalsIgnoreCase(userEmail));
                })
                .filter(coupon -> canUserRedeem(coupon, user))
                .map(this::toCouponResponse)
                .toList();
    }

    @Override
    @Transactional
    public WalletCouponResponse createCoupon(WalletCouponRequest request) {
        WalletCoupon coupon = WalletCoupon.builder()
                .code(normalizeCode(request.code()))
                .type(request.type())
                .amount(request.amount())
                .description(trimOrNull(request.description()))
                .assignedCustomerEmails(normalizeAssignedEmails(request.assignedCustomerEmails()))
                .active(request.active())
                .rewardDelayMinutes(request.rewardDelayMinutes() == null ? 60 : request.rewardDelayMinutes())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return toCouponResponse(walletCouponRepository.save(coupon));
    }

    @Override
    @Transactional
    public WalletCouponResponse updateCoupon(Long id, WalletCouponRequest request) {
        WalletCoupon coupon = walletCouponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        coupon.setCode(normalizeCode(request.code()));
        coupon.setType(request.type());
        coupon.setAmount(request.amount());
        coupon.setDescription(trimOrNull(request.description()));
        coupon.setAssignedCustomerEmails(normalizeAssignedEmails(request.assignedCustomerEmails()));
        coupon.setActive(request.active());
        coupon.setRewardDelayMinutes(request.rewardDelayMinutes() == null ? 60 : request.rewardDelayMinutes());
        coupon.setUpdatedAt(LocalDateTime.now());
        return toCouponResponse(walletCouponRepository.save(coupon));
    }

    @Override
    @Transactional
    public void deleteCoupon(Long id) {
        walletCouponRepository.deleteById(id);
    }

    @Override
    public List<WalletCouponRedemptionResponse> getCouponRedemptions(Long couponId) {
        return walletCouponRedemptionRepository.findByCouponIdOrderByUpdatedAtDesc(couponId).stream()
                .map(this::toRedemptionResponse)
                .toList();
    }

    @Override
    @Transactional
    public WalletCouponRedemptionResponse grantCouponRedemptions(Long couponId, WalletCouponGrantRequest request) {
        WalletCoupon coupon = walletCouponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        WalletCouponRedemption redemption = walletCouponRedemptionRepository
                .findByCouponIdAndUserId(couponId, request.userId())
                .orElseGet(() -> WalletCouponRedemption.builder()
                        .coupon(coupon)
                        .user(user)
                        .allowedRedemptions(1)
                        .redeemedCount(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build());
        redemption.setAllowedRedemptions(redemption.getAllowedRedemptions() + request.additionalRedemptions());
        redemption.setUpdatedAt(LocalDateTime.now());
        return toRedemptionResponse(walletCouponRedemptionRepository.save(redemption));
    }

    @Override
    @Transactional
    public void consumeCouponForUser(WalletCoupon coupon, User user) {
        WalletCouponRedemption redemption = walletCouponRedemptionRepository
                .findByCouponIdAndUserId(coupon.getId(), user.getId())
                .orElseGet(() -> WalletCouponRedemption.builder()
                        .coupon(coupon)
                        .user(user)
                        .allowedRedemptions(1)
                        .redeemedCount(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build());
        if (redemption.getRedeemedCount() >= redemption.getAllowedRedemptions()) {
            throw new BadRequestException("This code has already been used on your account");
        }
        redemption.setRedeemedCount(redemption.getRedeemedCount() + 1);
        redemption.setUpdatedAt(LocalDateTime.now());
        walletCouponRedemptionRepository.save(redemption);
    }

    @Override
    @Transactional
    public void applyDueWalletCredits() {
        List<Order> dueOrders = orderRepository.findAll().stream()
                .filter(order -> order.getWalletCreditAmount() != null)
                .filter(order -> !order.isWalletCreditProcessed())
                .filter(order -> order.getWalletCreditEligibleAt() != null)
                .filter(order -> !order.getWalletCreditEligibleAt().isAfter(LocalDateTime.now()))
                .toList();

        for (Order order : dueOrders) {
            creditWallet(
                    order.getUser(),
                    order.getWalletCreditAmount(),
                    "Wallet cashback for order " + order.getOrderNumber(),
                    order.getAppliedCouponCode()
            );
            order.setWalletCreditProcessed(true);
            orderRepository.save(order);
        }
    }

    public WalletCoupon validateCheckoutCoupon(String rawCode) {
        if (rawCode == null || rawCode.isBlank()) {
            return null;
        }
        WalletCoupon coupon = walletCouponRepository.findByCodeIgnoreCase(rawCode.trim())
                .orElseThrow(() -> new BadRequestException("Coupon code is invalid"));
        if (!coupon.isActive()) {
            throw new BadRequestException("Coupon code is inactive");
        }
        if (coupon.getType() != WalletCouponType.ORDER_CASHBACK) {
            throw new BadRequestException("This code should be used in wallet top-up");
        }
        if (!isAssignedToUser(coupon, currentUserService.getCurrentUser())) {
            throw new BadRequestException("This coupon code is not assigned to your account");
        }
        if (!canUserRedeem(coupon, currentUserService.getCurrentUser())) {
            throw new BadRequestException("This code has already been used on your account");
        }
        return coupon;
    }

    private WalletResponse buildWalletResponse(User user) {
        User persistedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<WalletTransactionResponse> transactions = walletTransactionRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(transaction -> new WalletTransactionResponse(
                        transaction.getId(),
                        transaction.getType(),
                        transaction.getAmount(),
                        transaction.getDescription(),
                        transaction.getReferenceCode(),
                        transaction.getCreatedAt()
                ))
                .toList();
        return new WalletResponse(persistedUser.getWalletBalance(), transactions);
    }

    private WalletCouponResponse toCouponResponse(WalletCoupon coupon) {
        return new WalletCouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getType(),
                coupon.getAmount(),
                coupon.getDescription(),
                coupon.getAssignedCustomerEmails(),
                coupon.isActive(),
                coupon.getRewardDelayMinutes()
        );
    }

    private WalletCouponRedemptionResponse toRedemptionResponse(WalletCouponRedemption redemption) {
        return new WalletCouponRedemptionResponse(
                redemption.getId(),
                redemption.getCoupon().getId(),
                redemption.getUser().getId(),
                redemption.getUser().getFullName(),
                redemption.getUser().getEmail(),
                redemption.getRedeemedCount(),
                redemption.getAllowedRedemptions(),
                Math.max(0, redemption.getAllowedRedemptions() - redemption.getRedeemedCount())
        );
    }

    private void creditWallet(User user, BigDecimal amount, String description, String referenceCode) {
        user.setWalletBalance(user.getWalletBalance().add(amount));
        userRepository.save(user);
        walletTransactionRepository.save(WalletTransaction.builder()
                .user(user)
                .type(WalletTransactionType.CREDIT)
                .amount(amount)
                .description(description)
                .referenceCode(referenceCode)
                .createdAt(LocalDateTime.now())
                .build());
    }

    private String normalizeCode(String value) {
        return value.trim().toUpperCase();
    }

    private String trimOrNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String normalizeAssignedEmails(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return java.util.Arrays.stream(value.split("[,\\n]"))
                .map(String::trim)
                .filter(email -> !email.isBlank())
                .map(String::toLowerCase)
                .distinct()
                .reduce((left, right) -> left + "," + right)
                .orElse(null);
    }

    private boolean isAssignedToUser(WalletCoupon coupon, User user) {
        String assignedEmails = coupon.getAssignedCustomerEmails();
        if (assignedEmails == null || assignedEmails.isBlank()) {
            return true;
        }
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return false;
        }
        return java.util.Arrays.stream(assignedEmails.split(","))
                .map(String::trim)
                .anyMatch(email -> email.equalsIgnoreCase(user.getEmail().trim()));
    }

    private boolean canUserRedeem(WalletCoupon coupon, User user) {
        return walletCouponRedemptionRepository.findByCouponIdAndUserId(coupon.getId(), user.getId())
                .map(redemption -> redemption.getRedeemedCount() < redemption.getAllowedRedemptions())
                .orElse(true);
    }
}
