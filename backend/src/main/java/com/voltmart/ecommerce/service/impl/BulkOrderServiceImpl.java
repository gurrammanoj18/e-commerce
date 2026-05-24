package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.bulk.BulkOrderRequest;
import com.voltmart.ecommerce.dto.common.ApiResponse;
import com.voltmart.ecommerce.entity.BulkOrderInquiry;
import com.voltmart.ecommerce.repository.BulkOrderInquiryRepository;
import com.voltmart.ecommerce.service.BulkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BulkOrderServiceImpl implements BulkOrderService {

    private final BulkOrderInquiryRepository bulkOrderInquiryRepository;

    @Override
    public ApiResponse submitInquiry(BulkOrderRequest request) {
        bulkOrderInquiryRepository.save(BulkOrderInquiry.builder()
                .companyName(request.companyName())
                .contactPerson(request.contactPerson())
                .email(request.email())
                .phone(request.phone())
                .productCategory(request.productCategory())
                .estimatedQuantity(request.estimatedQuantity())
                .requirements(request.requirements())
                .createdAt(LocalDateTime.now())
                .build());
        return new ApiResponse("Bulk order inquiry submitted successfully");
    }
}
