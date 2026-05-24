package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.bulk.BulkOrderRequest;
import com.voltmart.ecommerce.dto.common.ApiResponse;

public interface BulkOrderService {
    ApiResponse submitInquiry(BulkOrderRequest request);
}
