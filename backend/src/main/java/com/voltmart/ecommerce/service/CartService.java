package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.cart.CartItemRequest;
import com.voltmart.ecommerce.dto.cart.CartResponse;

public interface CartService {
    CartResponse getCartForCurrentUser();
    CartResponse addItem(CartItemRequest request);
    CartResponse updateItem(Long itemId, CartItemRequest request);
    CartResponse removeItem(Long itemId);
    void clearCart();
}
