package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.returnrequest.ReturnRequestCreateRequest;
import com.voltmart.ecommerce.dto.returnrequest.ReturnRequestResponse;
import com.voltmart.ecommerce.dto.returnrequest.ReturnRequestUpdateRequest;
import com.voltmart.ecommerce.entity.ReturnRequest;
import com.voltmart.ecommerce.entity.WalletTransaction;
import com.voltmart.ecommerce.entity.enums.OrderStatus;
import com.voltmart.ecommerce.entity.enums.ReturnResolution;
import com.voltmart.ecommerce.entity.enums.ReturnRequestStatus;
import com.voltmart.ecommerce.entity.enums.ReturnRequestType;
import com.voltmart.ecommerce.entity.enums.Role;
import com.voltmart.ecommerce.entity.enums.WalletTransactionType;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.repository.OrderRepository;
import com.voltmart.ecommerce.repository.ReturnRequestRepository;
import com.voltmart.ecommerce.repository.UserRepository;
import com.voltmart.ecommerce.repository.WalletTransactionRepository;
import com.voltmart.ecommerce.service.CurrentUserService;
import com.voltmart.ecommerce.service.ReturnRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnRequestServiceImpl implements ReturnRequestService {
    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public ReturnRequestResponse createReturnRequest(ReturnRequestCreateRequest request) {
        var user = currentUserService.getCurrentUser();
        var order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        boolean initiatedByAdmin = user.getRole() == Role.ROLE_ADMIN;
        if (!initiatedByAdmin && !order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You can only request a return for your own order");
        }
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Returns can only be requested after delivery");
        }
        if (returnRequestRepository.existsByOrder_Id(order.getId())) {
            throw new BadRequestException("A return request already exists for this order");
        }
        validateRequestType(request.requestType(), request.preferredResolution());

        ReturnRequest returnRequest = returnRequestRepository.save(ReturnRequest.builder()
                .order(order)
                .user(initiatedByAdmin ? order.getUser() : user)
                .status(ReturnRequestStatus.REQUESTED)
                .requestType(request.requestType())
                .preferredResolution(request.preferredResolution())
                .reason(request.reason().trim())
                .description(request.description().trim())
                .initiatedByAdmin(initiatedByAdmin)
                .createdAt(LocalDateTime.now())
                .refundProcessed(false)
                .build());

        return toResponse(returnRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReturnRequestResponse> getCurrentUserReturnRequests() {
        var userId = currentUserService.getCurrentUser().getId();
        return returnRequestRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReturnRequestResponse> getAllReturnRequests() {
        return returnRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ReturnRequestResponse updateReturnRequest(Long id, ReturnRequestUpdateRequest request) {
        ReturnRequest returnRequest = returnRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found"));

        returnRequest.setStatus(request.status());
        returnRequest.setAdminNote(normalizeText(request.adminNote()));
        returnRequest.setReviewedAt(LocalDateTime.now());
        if (request.status() == ReturnRequestStatus.REFUNDED) {
            processRefund(returnRequest);
        }
        return toResponse(returnRequestRepository.save(returnRequest));
    }

    private void processRefund(ReturnRequest returnRequest) {
        if (returnRequest.isRefundProcessed()) {
            return;
        }

        if (returnRequest.getPreferredResolution() == ReturnResolution.WALLET_CREDIT) {
            creditWalletRefund(returnRequest, returnRequest.getOrder().getTotalAmount());
        }

        returnRequest.setRefundProcessed(true);
        returnRequest.setRefundedAt(LocalDateTime.now());
        String refundAmount = returnRequest.getOrder().getTotalAmount().toPlainString();
        String note = switch (returnRequest.getPreferredResolution()) {
            case WALLET_CREDIT -> "Refund completed as wallet credit for INR " + refundAmount + ".";
            case MANUAL_REFUND -> "Manual COD refund marked completed by admin for INR " + refundAmount + ".";
            case REPLACEMENT -> "Replacement request marked completed by admin.";
        };
        returnRequest.setAdminNote(appendAdminNote(returnRequest.getAdminNote(), note));
    }

    private void creditWalletRefund(ReturnRequest returnRequest, BigDecimal amount) {
        var user = returnRequest.getUser();
        user.setWalletBalance(user.getWalletBalance().add(amount));
        userRepository.save(user);
        walletTransactionRepository.save(WalletTransaction.builder()
                .user(user)
                .type(WalletTransactionType.CREDIT)
                .amount(amount)
                .description("Return refund for order " + returnRequest.getOrder().getOrderNumber())
                .referenceCode(returnRequest.getOrder().getOrderNumber().toString())
                .createdAt(LocalDateTime.now())
                .build());
    }

    private String appendAdminNote(String currentNote, String refundNote) {
        if (!StringUtils.hasText(currentNote)) {
            return refundNote;
        }
        if (currentNote.contains(refundNote)) {
            return currentNote;
        }
        return currentNote.trim() + "\n" + refundNote;
    }

    private ReturnRequestResponse toResponse(ReturnRequest request) {
        return new ReturnRequestResponse(
                request.getId(),
                request.getOrder().getId(),
                request.getOrder().getOrderNumber().toString(),
                request.getOrder().getStatus().name(),
                request.getOrder().getShippingName(),
                request.getOrder().getPhone(),
                request.getOrder().getShippingAddress(),
                request.getOrder().getCity(),
                request.getOrder().getPostalCode(),
                request.getReason(),
                request.getDescription(),
                request.getRequestType(),
                request.getPreferredResolution(),
                request.getStatus(),
                request.getAdminNote(),
                request.isInitiatedByAdmin(),
                request.getOrder().getTotalAmount(),
                request.getCreatedAt(),
                request.getReviewedAt(),
                request.getRefundedAt(),
                request.isRefundProcessed()
        );
    }

    private String normalizeText(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private void validateRequestType(ReturnRequestType requestType, ReturnResolution preferredResolution) {
        if (requestType == ReturnRequestType.REPLACEMENT && preferredResolution != ReturnResolution.REPLACEMENT) {
            throw new BadRequestException("Replacement requests must use replacement resolution");
        }

        if (requestType == ReturnRequestType.RETURN && preferredResolution == ReturnResolution.REPLACEMENT) {
            throw new BadRequestException("Return requests cannot use replacement resolution");
        }
    }
}
