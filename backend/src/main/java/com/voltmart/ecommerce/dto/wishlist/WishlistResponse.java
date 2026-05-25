package com.voltmart.ecommerce.dto.wishlist;

import com.voltmart.ecommerce.dto.product.ProductResponse;

import java.util.List;

public record WishlistResponse(
        Long id,
        List<WishlistItemResponse> items,
        List<ProductResponse> products,
        Integer itemCount
) {
}
