package com.voltmart.ecommerce.dto.service;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record ServiceRequestCreateRequest(
        @NotBlank String serviceKey,
        @NotBlank String serviceName,
        @NotBlank @Pattern(regexp = "^[A-Za-z][A-Za-z\\s.'-]*$", message = "Customer name can only contain letters") String customerName,
        @NotBlank @Pattern(regexp = "^\\d{10}$", message = "Mobile number must be exactly 10 digits") String phoneNumber,
        @NotBlank String address,
        @NotBlank @Pattern(regexp = "^\\d{6}$", message = "Postal code must be exactly 6 digits") String postalCode,
        @NotBlank String description,
        List<String> problemImages
) {
}
