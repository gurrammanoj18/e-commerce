package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.bulk.BulkInquiryLineItemRequest;
import com.voltmart.ecommerce.dto.bulk.BulkInquiryLineItemResponse;
import com.voltmart.ecommerce.dto.bulk.BulkInquiryUpdateRequest;
import com.voltmart.ecommerce.dto.bulk.BulkOrderRequest;
import com.voltmart.ecommerce.dto.bulk.BulkOrderResponse;
import com.voltmart.ecommerce.entity.BulkOrderInquiry;
import com.voltmart.ecommerce.entity.BulkOrderInquiryLineItem;
import com.voltmart.ecommerce.entity.Product;
import com.voltmart.ecommerce.entity.enums.BulkQuoteStatus;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.repository.BulkOrderInquiryLineItemRepository;
import com.voltmart.ecommerce.repository.BulkOrderInquiryRepository;
import com.voltmart.ecommerce.repository.ProductRepository;
import com.voltmart.ecommerce.service.BulkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BulkOrderServiceImpl implements BulkOrderService {

    private final BulkOrderInquiryRepository bulkOrderInquiryRepository;
    private final BulkOrderInquiryLineItemRepository bulkOrderInquiryLineItemRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public BulkOrderResponse submitInquiry(BulkOrderRequest request) {
        BulkOrderInquiry inquiry = BulkOrderInquiry.builder()
                .companyName(resolveText(request.companyName(), request.name()))
                .contactPerson(resolveText(request.contactPerson(), request.name()))
                .email(request.email())
                .phone(resolveText(request.phone(), request.mobileNumber()))
                .productCategory(resolveText(request.productCategory(), "General requirement"))
                .estimatedQuantity(request.estimatedQuantity() == null ? 1 : request.estimatedQuantity())
                .deliveryCity(resolveText(request.deliveryCity(), request.address()))
                .budgetAmount(null)
                .rfqRequired(false)
                .priorityRequest(request.priorityRequest())
                .requirements(request.requirements())
                .quoteStatus(BulkQuoteStatus.NEW)
                .adminNotes(null)
                .createdAt(LocalDateTime.now())
                .build();
        BulkOrderInquiry savedInquiry = bulkOrderInquiryRepository.save(inquiry);
        List<BulkOrderInquiryLineItem> lineItems = new ArrayList<>();
        savedInquiry.setLineItems(lineItems);
        savedInquiry.setEstimatedTotal(lineItems.stream()
                .map(BulkOrderInquiryLineItem::getEstimatedLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return toResponse(bulkOrderInquiryRepository.save(savedInquiry));
    }

    @Override
    public List<BulkOrderResponse> getAllInquiries() {
        return bulkOrderInquiryRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BulkOrderResponse updateInquiry(Long id, BulkInquiryUpdateRequest request) {
        BulkOrderInquiry inquiry = bulkOrderInquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bulk inquiry not found"));
        if (request.quoteStatus() != null && !request.quoteStatus().isBlank()) {
            inquiry.setQuoteStatus(BulkQuoteStatus.valueOf(request.quoteStatus().trim().toUpperCase()));
        }
        if (request.adminNotes() != null) {
            inquiry.setAdminNotes(blankToNull(request.adminNotes()));
        }
        if (request.estimatedTotal() != null) {
            inquiry.setEstimatedTotal(request.estimatedTotal());
        }
        inquiry.setPriorityRequest(request.priorityRequest());
        return toResponse(bulkOrderInquiryRepository.save(inquiry));
    }

    private List<BulkOrderInquiryLineItem> buildLineItems(
            BulkOrderInquiry inquiry,
            List<BulkInquiryLineItemRequest> requestedItems
    ) {
        if (requestedItems == null || requestedItems.isEmpty()) {
            return new ArrayList<>();
        }

        return requestedItems.stream()
                .map(item -> {
                    Product product = item.productId() == null ? null : productRepository.findById(item.productId())
                            .orElseThrow(() -> new ResourceNotFoundException("Product not found for bulk quote"));
                    String productName = product != null ? product.getName() : item.productName();
                    BigDecimal unitPrice = product != null ? product.getPrice() : BigDecimal.ZERO;
                    int quantity = item.quantity() == null ? 1 : item.quantity();
                    int discountPercentage = calculateDiscountPercentage(quantity);
                    BigDecimal lineTotal = unitPrice
                            .multiply(BigDecimal.valueOf(quantity))
                            .multiply(BigDecimal.valueOf(100 - discountPercentage))
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    return bulkOrderInquiryLineItemRepository.save(BulkOrderInquiryLineItem.builder()
                            .inquiry(inquiry)
                            .product(product)
                            .productName(productName == null || productName.isBlank() ? "Custom item" : productName.trim())
                            .requestedQuantity(quantity)
                            .unitPrice(unitPrice)
                            .discountPercentage(discountPercentage)
                            .estimatedLineTotal(lineTotal)
                            .build());
                })
                .toList();
    }

    private int calculateDiscountPercentage(int quantity) {
        if (quantity >= 100) {
            return 15;
        }
        if (quantity >= 50) {
            return 10;
        }
        if (quantity >= 20) {
            return 7;
        }
        if (quantity >= 10) {
            return 5;
        }
        return 0;
    }

    private BulkOrderResponse toResponse(BulkOrderInquiry inquiry) {
        return new BulkOrderResponse(
                inquiry.getId(),
                inquiry.getCompanyName(),
                inquiry.getContactPerson(),
                inquiry.getEmail(),
                inquiry.getPhone(),
                inquiry.getProductCategory(),
                inquiry.getEstimatedQuantity(),
                inquiry.getDeliveryCity(),
                inquiry.getBudgetAmount(),
                inquiry.isRfqRequired(),
                inquiry.isPriorityRequest(),
                inquiry.getRequirements(),
                inquiry.getEstimatedTotal(),
                inquiry.getQuoteStatus().name(),
                inquiry.getAdminNotes(),
                inquiry.getCreatedAt(),
                inquiry.getLineItems().stream()
                        .map(item -> new BulkInquiryLineItemResponse(
                                item.getId(),
                                item.getProduct() == null ? null : item.getProduct().getId(),
                                item.getProductName(),
                                item.getRequestedQuantity(),
                                item.getUnitPrice(),
                                item.getDiscountPercentage(),
                                item.getEstimatedLineTotal()
                        ))
                        .toList()
        );
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String resolveText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback.trim() : value.trim();
    }
}
