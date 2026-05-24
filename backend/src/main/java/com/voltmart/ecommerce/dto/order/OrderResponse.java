package com.voltmart.ecommerce.dto.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        String status,
        String shippingName,
        String email,
        String phone,
        String shippingAddress,
        String city,
        String postalCode,
        BigDecimal subtotal,
        BigDecimal shippingCost,
        BigDecimal taxAmount,
        BigDecimal totalAmount,
        String whatsappTrackingMessage,
        LocalDateTime createdAt,
        List<OrderItemResponse> items
) {
}
