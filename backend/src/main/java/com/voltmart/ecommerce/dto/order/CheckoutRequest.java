package com.voltmart.ecommerce.dto.order;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CheckoutRequest(
        @NotBlank String shippingName,
        @Email @NotBlank String email,
        @NotBlank String phone,
        @NotBlank String shippingAddress,
        @NotBlank String city,
        @NotBlank String postalCode
) {
}
