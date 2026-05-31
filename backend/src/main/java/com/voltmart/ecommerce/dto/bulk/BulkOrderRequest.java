package com.voltmart.ecommerce.dto.bulk;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record BulkOrderRequest(
        String companyName,
        String contactPerson,
        @Email String email,
        String phone,
        String productCategory,
        Integer estimatedQuantity,
        @NotBlank String requirements,
        @NotBlank String name,
        @NotBlank String address,
        @NotBlank String mobileNumber,
        String deliveryCity,
        BigDecimal budgetAmount,
        boolean rfqRequired,
        boolean priorityRequest,
        List<BulkInquiryLineItemRequest> items
) {
}
