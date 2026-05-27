package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.BulkOrderInquiryLineItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BulkOrderInquiryLineItemRepository extends JpaRepository<BulkOrderInquiryLineItem, Long> {
}
