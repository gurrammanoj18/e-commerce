package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    void deleteByProductIdIn(Collection<Long> productIds);
}
