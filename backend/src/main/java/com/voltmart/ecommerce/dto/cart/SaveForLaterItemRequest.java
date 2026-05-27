package com.voltmart.ecommerce.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SaveForLaterItemRequest(
        @NotNull Long productId,
        @Min(1) Integer quantity
) {
}
