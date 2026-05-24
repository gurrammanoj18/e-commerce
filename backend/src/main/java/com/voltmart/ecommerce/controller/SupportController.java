package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.bulk.BulkOrderRequest;
import com.voltmart.ecommerce.dto.common.ApiResponse;
import com.voltmart.ecommerce.service.BulkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController {

    private final BulkOrderService bulkOrderService;

    @PostMapping("/bulk-order")
    public ApiResponse submitBulkOrder(@Valid @RequestBody BulkOrderRequest request) {
        return bulkOrderService.submitInquiry(request);
    }
}
