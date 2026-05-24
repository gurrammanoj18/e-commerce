package com.voltmart.ecommerce.dto.order;

import java.math.BigDecimal;

public record OrderItemResponse(
        String productName,
        String productSlug,
        Integer quantity,
        BigDecimal unitPrice
) {
}
