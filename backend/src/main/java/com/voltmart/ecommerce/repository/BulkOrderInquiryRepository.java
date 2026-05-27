package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.BulkOrderInquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BulkOrderInquiryRepository extends JpaRepository<BulkOrderInquiry, Long> {
    List<BulkOrderInquiry> findAllByOrderByCreatedAtDesc();
}
