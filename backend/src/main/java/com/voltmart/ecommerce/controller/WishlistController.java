package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.wishlist.WishlistItemRequest;
import com.voltmart.ecommerce.dto.wishlist.WishlistResponse;
import com.voltmart.ecommerce.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public WishlistResponse getWishlist() {
        return wishlistService.getWishlistForCurrentUser();
    }

    @PostMapping("/items")
    public WishlistResponse addItem(@Valid @RequestBody WishlistItemRequest request) {
        return wishlistService.addItem(request);
    }

    @DeleteMapping("/items/{itemId}")
    public WishlistResponse removeItem(@PathVariable Long itemId) {
        return wishlistService.removeItem(itemId);
    }
}
