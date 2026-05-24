package com.voltmart.ecommerce.dto.product;

import java.time.LocalDateTime;

public record InventoryResponse(
        Long inventoryId,
        Long productId,
        String productName,
        Integer stockQuantity,
        Integer lowStockThreshold,
        Boolean lowStock,
        LocalDateTime updatedAt
) {
}
