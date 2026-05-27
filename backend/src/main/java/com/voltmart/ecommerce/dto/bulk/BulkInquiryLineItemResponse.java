package com.voltmart.ecommerce.dto.bulk;

import java.math.BigDecimal;

public record BulkInquiryLineItemResponse(
        Long id,
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        Integer discountPercentage,
        BigDecimal estimatedLineTotal
) {
}
