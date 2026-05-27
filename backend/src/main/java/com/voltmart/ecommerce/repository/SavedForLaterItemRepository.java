package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.SavedForLaterItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedForLaterItemRepository extends JpaRepository<SavedForLaterItem, Long> {
    List<SavedForLaterItem> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<SavedForLaterItem> findByUserIdAndProductId(Long userId, Long productId);
    Optional<SavedForLaterItem> findByIdAndUserId(Long id, Long userId);
}
