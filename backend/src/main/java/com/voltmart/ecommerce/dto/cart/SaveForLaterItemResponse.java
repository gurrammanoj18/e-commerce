package com.voltmart.ecommerce.dto.cart;

import com.voltmart.ecommerce.dto.product.ProductResponse;

import java.time.LocalDateTime;

public record SaveForLaterItemResponse(
        Long id,
        Integer quantity,
        LocalDateTime createdAt,
        ProductResponse product
) {
}
