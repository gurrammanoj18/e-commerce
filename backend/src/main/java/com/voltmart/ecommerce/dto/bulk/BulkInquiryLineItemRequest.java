package com.voltmart.ecommerce.dto.bulk;

import jakarta.validation.constraints.Min;

public record BulkInquiryLineItemRequest(
        Long productId,
        String productName,
        @Min(1) Integer quantity
) {
}
