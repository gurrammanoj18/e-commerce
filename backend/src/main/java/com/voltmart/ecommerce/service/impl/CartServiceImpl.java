package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.cart.CartItemRequest;
import com.voltmart.ecommerce.dto.cart.CartItemResponse;
import com.voltmart.ecommerce.dto.cart.CartResponse;
import com.voltmart.ecommerce.entity.Cart;
import com.voltmart.ecommerce.entity.CartItem;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.repository.CartItemRepository;
import com.voltmart.ecommerce.repository.CartRepository;
import com.voltmart.ecommerce.repository.InventoryRepository;
import com.voltmart.ecommerce.repository.ProductRepository;
import com.voltmart.ecommerce.service.CartService;
import com.voltmart.ecommerce.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CurrentUserService currentUserService;

    @Override
    public CartResponse getCartForCurrentUser() {
        return toResponse(currentUserCart());
    }

    @Override
    @Transactional
    public CartResponse addItem(CartItemRequest request) {
        Cart cart = currentUserCart();
        var product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        var inventory = inventoryRepository.findByProductId(product.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
        if (inventory.getStockQuantity() < request.quantity()) {
            throw new BadRequestException("Requested quantity exceeds stock availability");
        }

        var existing = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();
        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + request.quantity());
        } else {
            cart.getItems().add(CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.quantity())
                    .build());
        }
        return toResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartResponse updateItem(Long itemId, CartItemRequest request) {
        Cart cart = currentUserCart();
        CartItem item = cart.getItems().stream()
                .filter(cartItem -> cartItem.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        if (request.quantity() <= 0) {
            return removeItem(itemId);
        }
        item.setQuantity(request.quantity());
        return toResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long itemId) {
        Cart cart = currentUserCart();
        CartItem item = cart.getItems().stream()
                .filter(cartItem -> cartItem.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        cartRepository.flush();

        return toResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart() {
        Cart cart = currentUserCart();
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart currentUserCart() {
        var user = currentUserService.getCurrentUser();
        Long userId = user.getId();
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    private CartResponse toResponse(Cart cart) {
        var items = cart.getItems().stream().map(item -> {
            int stockQuantity = inventoryRepository.findByProductId(item.getProduct().getId())
                    .map(inventory -> inventory.getStockQuantity())
                    .orElse(0);
            return new CartItemResponse(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getProduct().getName(),
                    item.getProduct().getSlug(),
                    item.getProduct().getImageUrls().isEmpty() ? "" : item.getProduct().getImageUrls().getFirst(),
                    item.getProduct().getPrice(),
                    item.getQuantity(),
                    item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())),
                    stockQuantity
            );
        }).toList();

        BigDecimal subtotal = items.stream().map(CartItemResponse::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(cart.getId(), items, items.stream().mapToInt(CartItemResponse::quantity).sum(), subtotal);
    }
}
