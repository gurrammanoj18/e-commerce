package com.voltmart.ecommerce.dto.returnrequest;

import com.voltmart.ecommerce.entity.enums.ReturnResolution;
import com.voltmart.ecommerce.entity.enums.ReturnRequestStatus;
import com.voltmart.ecommerce.entity.enums.ReturnRequestType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReturnRequestResponse(
        Long id,
        Long orderId,
        String orderNumber,
        String orderStatus,
        String customerName,
        String phoneNumber,
        String shippingAddress,
        String city,
        String postalCode,
        String reason,
        String description,
        ReturnRequestType requestType,
        ReturnResolution preferredResolution,
        ReturnRequestStatus status,
        String adminNote,
        boolean initiatedByAdmin,
        BigDecimal orderTotal,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt,
        LocalDateTime refundedAt,
        boolean refundProcessed
) {
}
