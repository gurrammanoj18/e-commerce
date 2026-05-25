package com.voltmart.ecommerce.dto.wishlist;

import java.time.LocalDateTime;

public record WishlistItemResponse(
        Long id,
        Long productId,
        LocalDateTime addedAt
) {
}
