package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    void deleteByProductIdIn(Collection<Long> productIds);
}
