package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    List<ReturnRequest> findByUser_IdOrderByCreatedAtDesc(Long userId);
    List<ReturnRequest> findAllByOrderByCreatedAtDesc();
    boolean existsByOrder_Id(Long orderId);
}
