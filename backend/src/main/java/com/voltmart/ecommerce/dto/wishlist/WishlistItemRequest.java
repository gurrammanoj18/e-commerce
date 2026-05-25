package com.voltmart.ecommerce.dto.wishlist;

import jakarta.validation.constraints.NotNull;

public record WishlistItemRequest(@NotNull Long productId) {
}
