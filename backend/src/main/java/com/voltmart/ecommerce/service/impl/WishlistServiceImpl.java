package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.wishlist.WishlistItemRequest;
import com.voltmart.ecommerce.dto.wishlist.WishlistResponse;
import com.voltmart.ecommerce.entity.Wishlist;
import com.voltmart.ecommerce.entity.WishlistItem;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.mapper.EntityMapper;
import com.voltmart.ecommerce.repository.InventoryRepository;
import com.voltmart.ecommerce.repository.ProductRepository;
import com.voltmart.ecommerce.repository.WishlistItemRepository;
import com.voltmart.ecommerce.repository.WishlistRepository;
import com.voltmart.ecommerce.service.CurrentUserService;
import com.voltmart.ecommerce.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CurrentUserService currentUserService;
    private final EntityMapper entityMapper;

    @Override
    public WishlistResponse getWishlistForCurrentUser() {
        return toResponse(currentUserWishlist());
    }

    @Override
    @Transactional
    public WishlistResponse addItem(WishlistItemRequest request) {
        Wishlist wishlist = currentUserWishlist();
        var product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        boolean alreadyPresent = wishlist.getItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(product.getId()));
        if (alreadyPresent) {
            throw new BadRequestException("Product is already in wishlist");
        }

        wishlist.getItems().add(WishlistItem.builder()
                .wishlist(wishlist)
                .product(product)
                .createdAt(LocalDateTime.now())
                .build());
        return toResponse(wishlistRepository.save(wishlist));
    }

    @Override
    @Transactional
    public WishlistResponse removeItem(Long itemId) {
        Wishlist wishlist = currentUserWishlist();
        WishlistItem item = wishlist.getItems().stream()
                .filter(wishlistItem -> wishlistItem.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found"));

        wishlist.getItems().remove(item);
        wishlistItemRepository.delete(item);
        wishlistRepository.flush();

        return toResponse(wishlist);
    }

    private Wishlist currentUserWishlist() {
        var currentUser = currentUserService.getCurrentUser();
        return wishlistRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> wishlistRepository.save(Wishlist.builder().user(currentUser).build()));
    }

    private WishlistResponse toResponse(Wishlist wishlist) {
        var inventoryByProductId = wishlist.getItems().stream()
                .map(WishlistItem::getProduct)
                .collect(java.util.stream.Collectors.toMap(
                        product -> product.getId(),
                        product -> inventoryRepository.findByProductId(product.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Inventory missing for product " + product.getId()))
                ));
        return entityMapper.toWishlistResponse(wishlist, inventoryByProductId);
    }
}
