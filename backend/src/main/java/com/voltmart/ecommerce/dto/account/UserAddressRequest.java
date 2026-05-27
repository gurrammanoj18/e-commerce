package com.voltmart.ecommerce.dto.account;

import jakarta.validation.constraints.NotBlank;

public record UserAddressRequest(
        @NotBlank String label,
        @NotBlank String recipientName,
        @NotBlank String phone,
        @NotBlank String streetAddress,
        @NotBlank String city,
        @NotBlank String postalCode,
        boolean defaultAddress
) {
}
