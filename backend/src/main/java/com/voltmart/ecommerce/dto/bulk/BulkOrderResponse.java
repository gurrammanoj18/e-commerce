package com.voltmart.ecommerce.dto.bulk;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BulkOrderResponse(
        Long id,
        String companyName,
        String contactPerson,
        String email,
        String phone,
        String productCategory,
        Integer estimatedQuantity,
        String deliveryCity,
        BigDecimal budgetAmount,
        boolean rfqRequired,
        boolean priorityRequest,
        String requirements,
        BigDecimal estimatedTotal,
        String quoteStatus,
        String adminNotes,
        LocalDateTime createdAt,
        List<BulkInquiryLineItemResponse> items
) {
}
