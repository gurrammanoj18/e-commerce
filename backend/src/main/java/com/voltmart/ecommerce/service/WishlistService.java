package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.wishlist.WishlistItemRequest;
import com.voltmart.ecommerce.dto.wishlist.WishlistResponse;

public interface WishlistService {
    WishlistResponse getWishlistForCurrentUser();
    WishlistResponse addItem(WishlistItemRequest request);
    WishlistResponse removeItem(Long itemId);
}
