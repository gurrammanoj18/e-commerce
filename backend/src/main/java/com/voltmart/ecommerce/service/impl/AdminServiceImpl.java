package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.product.InventoryResponse;
import com.voltmart.ecommerce.dto.user.AdminUserResponse;
import com.voltmart.ecommerce.repository.*;
import com.voltmart.ecommerce.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;
    private final BulkOrderInquiryRepository bulkOrderInquiryRepository;

    @Override
    public Map<String, Object> getDashboardOverview() {
        long lowStockCount = inventoryRepository.findAll().stream()
                .filter(inventory -> inventory.getStockQuantity() <= inventory.getLowStockThreshold())
                .count();

        return Map.of(
                "productCount", productRepository.count(),
                "orderCount", orderRepository.count(),
                "userCount", userRepository.count(),
                "bulkInquiryCount", bulkOrderInquiryRepository.count(),
                "lowStockCount", lowStockCount
        );
    }

    @Override
    public List<AdminUserResponse> getUsers() {
        return userRepository.findAll().stream()
                .map(user -> new AdminUserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name(), user.getCreatedAt()))
                .toList();
    }

    @Override
    public List<InventoryResponse> getInventory() {
        return inventoryRepository.findAll().stream()
                .map(inventory -> new InventoryResponse(
                        inventory.getId(),
                        inventory.getProduct().getId(),
                        inventory.getProduct().getName(),
                        inventory.getStockQuantity(),
                        inventory.getLowStockThreshold(),
                        inventory.getStockQuantity() <= inventory.getLowStockThreshold(),
                        inventory.getUpdatedAt()
                ))
                .toList();
    }
}
