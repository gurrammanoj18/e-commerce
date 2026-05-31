package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.order.CheckoutRequest;
import com.voltmart.ecommerce.dto.order.OrderResponse;
import com.voltmart.ecommerce.entity.Order;
import com.voltmart.ecommerce.entity.OrderItem;
import com.voltmart.ecommerce.entity.WalletTransaction;
import com.voltmart.ecommerce.entity.WalletCoupon;
import com.voltmart.ecommerce.entity.enums.DeliveryMode;
import com.voltmart.ecommerce.entity.enums.OrderStatus;
import com.voltmart.ecommerce.entity.enums.WalletCouponType;
import com.voltmart.ecommerce.entity.enums.WalletTransactionType;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.mapper.EntityMapper;
import com.voltmart.ecommerce.repository.CartRepository;
import com.voltmart.ecommerce.repository.InventoryRepository;
import com.voltmart.ecommerce.repository.OrderRepository;
import com.voltmart.ecommerce.repository.UserAddressRepository;
import com.voltmart.ecommerce.repository.WalletCouponRepository;
import com.voltmart.ecommerce.repository.WalletTransactionRepository;
import com.voltmart.ecommerce.service.CurrentUserService;
import com.voltmart.ecommerce.service.EmailNotificationService;
import com.voltmart.ecommerce.service.OrderService;
import com.voltmart.ecommerce.service.ServiceablePincodeService;
import com.voltmart.ecommerce.service.WalletService;
import com.voltmart.ecommerce.service.WhatsappNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private static final Set<OrderStatus> STORE_PICKUP_ALLOWED_STATUSES = Set.of(
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
            OrderStatus.DELIVERED
    );

    private final CurrentUserService currentUserService;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final UserAddressRepository userAddressRepository;
    private final WalletCouponRepository walletCouponRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final EntityMapper entityMapper;
    private final WhatsappNotificationService whatsappNotificationService;
    private final EmailNotificationService emailNotificationService;
    private final WalletService walletService;
    private final ServiceablePincodeService serviceablePincodeService;

    @Override
    @Transactional
    public OrderResponse placeOrder(CheckoutRequest request) {
        walletService.applyDueWalletCredits();
        var user = currentUserService.getCurrentUser();
        var cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        BigDecimal subtotal = cart.getItems().stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        DeliveryMode deliveryMode = request.deliveryMode();
        boolean isStorePickup = deliveryMode == DeliveryMode.STORE_PICKUP;
        var selectedAddress = request.addressId() == null
                ? null
                : userAddressRepository.findByIdAndUserId(request.addressId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Saved address not found"));

        String shippingAddress = selectedAddress != null ? selectedAddress.getStreetAddress() : request.shippingAddress();
        String city = selectedAddress != null ? selectedAddress.getCity() : request.city();
        String postalCode = selectedAddress != null ? selectedAddress.getPostalCode() : request.postalCode();
        String slot = normalizeDeliverySlot(request.deliverySlot(), isStorePickup);

        if (!isStorePickup && (!StringUtils.hasText(shippingAddress)
                || !StringUtils.hasText(city)
                || !StringUtils.hasText(postalCode))) {
            throw new BadRequestException("Shipping address, city, and postal code are required for home delivery");
        }
        if (!isStorePickup) {
            serviceablePincodeService.validateHomeDeliveryPincode(postalCode);
        }
        BigDecimal shipping = isStorePickup
                ? BigDecimal.ZERO
                : subtotal.compareTo(BigDecimal.valueOf(4999)) >= 0 ? BigDecimal.ZERO : BigDecimal.valueOf(499);
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.18));
        BigDecimal totalBeforeWallet = subtotal.add(shipping).add(tax);
        BigDecimal walletDebitAmount = BigDecimal.ZERO;
        BigDecimal total = totalBeforeWallet;
        if (request.useWalletBalance() && user.getWalletBalance() != null && user.getWalletBalance().compareTo(BigDecimal.ZERO) > 0) {
            walletDebitAmount = user.getWalletBalance().min(totalBeforeWallet);
            total = totalBeforeWallet.subtract(walletDebitAmount);
            user.setWalletBalance(user.getWalletBalance().subtract(walletDebitAmount));
        }
        WalletCoupon cashbackCoupon = resolveCashbackCoupon(request.couponCode());

        Order order = Order.builder()
                .orderNumber(UUID.randomUUID())
                .user(user)
                .status(OrderStatus.PENDING)
                .deliveryMode(deliveryMode)
                .shippingName(resolveShippingName(request.shippingName(), user.getFullName()))
                .email(resolveEmail(request.email(), user.getEmail()))
                .phone(resolvePhone(request.phone(), user.getPhoneNumber()))
                .userAddress(selectedAddress)
                .shippingAddress(isStorePickup ? "Store pickup" : shippingAddress.trim())
                .city(isStorePickup ? "Store pickup" : city.trim())
                .postalCode(isStorePickup ? "STORE" : postalCode.trim())
                .deliverySlot(slot)
                .priorityOrder(request.priorityOrder())
                .priorityNotes(request.priorityNotes())
                .subtotal(subtotal)
                .shippingCost(shipping)
                .taxAmount(tax)
                .totalAmount(total)
                .walletDebitAmount(walletDebitAmount)
                .appliedCouponCode(cashbackCoupon == null ? null : cashbackCoupon.getCode())
                .walletCreditAmount(cashbackCoupon == null ? null : cashbackCoupon.getAmount())
                .walletCreditEligibleAt(cashbackCoupon == null
                        ? null
                        : LocalDateTime.now().plusMinutes(cashbackCoupon.getRewardDelayMinutes()))
                .walletCreditProcessed(false)
                .createdAt(LocalDateTime.now())
                .build();

        List<OrderItem> orderItems = cart.getItems().stream().map(item -> {
            var inventory = inventoryRepository.findByProductId(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
            if (inventory.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for " + item.getProduct().getName());
            }
            inventory.setStockQuantity(inventory.getStockQuantity() - item.getQuantity());
            inventory.setUpdatedAt(LocalDateTime.now());
            inventoryRepository.save(inventory);
            return OrderItem.builder()
                    .order(order)
                    .product(item.getProduct())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getProduct().getPrice())
                    .build();
        }).toList();

        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);
        if (cashbackCoupon != null) {
            walletService.consumeCouponForUser(cashbackCoupon, user);
        }
        if (walletDebitAmount.compareTo(BigDecimal.ZERO) > 0) {
            walletTransactionRepository.save(WalletTransaction.builder()
                    .user(user)
                    .type(WalletTransactionType.DEBIT)
                    .amount(walletDebitAmount)
                    .description("Wallet used for order " + savedOrder.getOrderNumber())
                    .referenceCode(savedOrder.getOrderNumber().toString())
                    .createdAt(LocalDateTime.now())
                    .build());
        }
        cart.getItems().clear();
        cartRepository.save(cart);
        whatsappNotificationService.sendOrderPlacedNotification(savedOrder);
        emailNotificationService.sendOrderPlacedNotification(savedOrder);
        return entityMapper.toOrderResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getCurrentUserOrders() {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUserService.getCurrentUser().getId()).stream()
                .map(entityMapper::toOrderResponse)
                .toList();
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(entityMapper::toOrderResponse).toList();
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        OrderStatus nextStatus = OrderStatus.valueOf(status.toUpperCase());
        if (order.getDeliveryMode() == DeliveryMode.STORE_PICKUP
                && !STORE_PICKUP_ALLOWED_STATUSES.contains(nextStatus)) {
            throw new BadRequestException("Store pickup orders can only be Pending, Confirmed, or Delivered");
        }
        OrderStatus previousStatus = order.getStatus();
        order.setStatus(nextStatus);
        Order savedOrder = orderRepository.save(order);
        whatsappNotificationService.sendOrderStatusUpdateNotification(savedOrder, previousStatus);
        emailNotificationService.sendOrderStatusUpdateNotification(savedOrder, previousStatus);
        return entityMapper.toOrderResponse(savedOrder);
    }

    @Override
    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        orderRepository.delete(order);
    }

    private String normalizeDeliverySlot(String value, boolean isStorePickup) {
        if (isStorePickup) {
            return "STORE_PICKUP_WINDOW";
        }
        if (!StringUtils.hasText(value)) {
            return "09:00-11:00";
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        Set<String> supportedSlots = Set.of(
                "09:00-11:00",
                "11:00-13:00",
                "13:00-15:00",
                "15:00-18:00",
                "18:00-21:00"
        );
        if (!supportedSlots.contains(normalized)) {
            throw new BadRequestException("Unsupported delivery slot selected");
        }
        return normalized;
    }

    private WalletCoupon resolveCashbackCoupon(String rawCode) {
        if (!StringUtils.hasText(rawCode)) {
            return null;
        }
        WalletCoupon coupon = walletCouponRepository.findByCodeIgnoreCase(rawCode.trim())
                .orElseThrow(() -> new BadRequestException("Coupon code is invalid"));
        if (!coupon.isActive()) {
            throw new BadRequestException("Coupon code is inactive");
        }
        if (coupon.getType() != WalletCouponType.ORDER_CASHBACK) {
            throw new BadRequestException("This code can only be used in wallet top-up");
        }
        String assignedEmails = coupon.getAssignedCustomerEmails();
        String userEmail = currentUserService.getCurrentUser().getEmail();
        if (StringUtils.hasText(assignedEmails)
                && (!StringUtils.hasText(userEmail)
                || java.util.Arrays.stream(assignedEmails.split(","))
                    .noneMatch(email -> email.trim().equalsIgnoreCase(userEmail.trim())))) {
            throw new BadRequestException("Coupon code is not assigned to this customer");
        }
        return coupon;
    }

    private String resolveShippingName(String requestValue, String userValue) {
        return StringUtils.hasText(requestValue) ? requestValue.trim() : userValue.trim();
    }

    private String resolveEmail(String requestValue, String userValue) {
        if (StringUtils.hasText(requestValue)) {
            return requestValue.trim();
        }
        return StringUtils.hasText(userValue) ? userValue.trim() : "";
    }

    private String resolvePhone(String requestValue, String userValue) {
        return StringUtils.hasText(requestValue) ? requestValue.trim() : userValue.trim();
    }
}
