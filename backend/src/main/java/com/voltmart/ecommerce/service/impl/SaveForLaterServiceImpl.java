package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.cart.SaveForLaterItemRequest;
import com.voltmart.ecommerce.dto.cart.SaveForLaterItemResponse;
import com.voltmart.ecommerce.dto.cart.SaveForLaterResponse;
import com.voltmart.ecommerce.entity.SavedForLaterItem;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.mapper.EntityMapper;
import com.voltmart.ecommerce.repository.InventoryRepository;
import com.voltmart.ecommerce.repository.ProductRepository;
import com.voltmart.ecommerce.repository.SavedForLaterItemRepository;
import com.voltmart.ecommerce.service.CurrentUserService;
import com.voltmart.ecommerce.service.SaveForLaterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SaveForLaterServiceImpl implements SaveForLaterService {

    private final SavedForLaterItemRepository savedForLaterItemRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CurrentUserService currentUserService;
    private final EntityMapper entityMapper;

    @Override
    public SaveForLaterResponse getItemsForCurrentUser() {
        return toResponse();
    }

    @Override
    @Transactional
    public SaveForLaterResponse addItem(SaveForLaterItemRequest request) {
        var user = currentUserService.getCurrentUser();
        var existing = savedForLaterItemRepository.findByUserIdAndProductId(user.getId(), request.productId());
        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + request.quantity());
            savedForLaterItemRepository.save(existing.get());
            return toResponse();
        }

        var product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        savedForLaterItemRepository.save(SavedForLaterItem.builder()
                .user(user)
                .product(product)
                .quantity(request.quantity())
                .createdAt(LocalDateTime.now())
                .build());
        return toResponse();
    }

    @Override
    @Transactional
    public SaveForLaterResponse removeItem(Long itemId) {
        var item = savedForLaterItemRepository.findByIdAndUserId(itemId, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Saved item not found"));
        savedForLaterItemRepository.delete(item);
        return toResponse();
    }

    private SaveForLaterResponse toResponse() {
        var items = savedForLaterItemRepository.findByUserIdOrderByCreatedAtDesc(currentUserService.getCurrentUser().getId())
                .stream()
                .map(this::toItemResponse)
                .toList();
        return new SaveForLaterResponse(items, items.size());
    }

    private SaveForLaterItemResponse toItemResponse(SavedForLaterItem item) {
        var inventory = inventoryRepository.findByProductId(item.getProduct().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
        return new SaveForLaterItemResponse(
                item.getId(),
                item.getQuantity(),
                item.getCreatedAt(),
                entityMapper.toProductResponse(item.getProduct(), inventory)
        );
    }
}
