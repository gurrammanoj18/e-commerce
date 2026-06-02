package com.voltmart.ecommerce.dto.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        String status,
        String deliveryMode,
        String shippingName,
        String email,
        String phone,
        String shippingAddress,
        String city,
        String postalCode,
        Long addressId,
        String deliverySlot,
        boolean priorityOrder,
        String priorityNotes,
        BigDecimal subtotal,
        BigDecimal shippingCost,
        BigDecimal taxAmount,
        BigDecimal totalAmount,
        BigDecimal walletDebitAmount,
        String appliedCouponCode,
        BigDecimal appliedDiscountAmount,
        BigDecimal walletCreditAmount,
        LocalDateTime walletCreditEligibleAt,
        boolean walletCreditProcessed,
        String whatsappTrackingMessage,
        LocalDateTime createdAt,
        List<OrderItemResponse> items
) {
}
