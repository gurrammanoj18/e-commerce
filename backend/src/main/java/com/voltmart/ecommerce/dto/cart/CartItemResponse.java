package com.voltmart.ecommerce.dto.cart;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long productId,
        String productName,
        String productSlug,
        String image,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal lineTotal,
        Integer stockQuantity
) {
}
