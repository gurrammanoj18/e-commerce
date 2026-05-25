package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    void deleteByProductIdIn(Collection<Long> productIds);
}
