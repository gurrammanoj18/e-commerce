package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.bulk.BulkOrderRequest;
import com.voltmart.ecommerce.dto.bulk.BulkOrderResponse;
import com.voltmart.ecommerce.dto.bulk.BulkInquiryUpdateRequest;

import java.util.List;

public interface BulkOrderService {
    BulkOrderResponse submitInquiry(BulkOrderRequest request);
    List<BulkOrderResponse> getAllInquiries();
    BulkOrderResponse updateInquiry(Long id, BulkInquiryUpdateRequest request);
}
