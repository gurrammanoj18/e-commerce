package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(Long productId);
    void deleteByProductIdIn(Collection<Long> productIds);
}
