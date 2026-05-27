package com.voltmart.ecommerce.dto.bulk;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record BulkOrderRequest(
        @NotBlank String companyName,
        @NotBlank String contactPerson,
        @Email @NotBlank String email,
        @NotBlank String phone,
        @NotBlank String productCategory,
        @NotNull Integer estimatedQuantity,
        @NotBlank String requirements,
        String deliveryCity,
        BigDecimal budgetAmount,
        boolean rfqRequired,
        boolean priorityRequest,
        List<BulkInquiryLineItemRequest> items
) {
}
