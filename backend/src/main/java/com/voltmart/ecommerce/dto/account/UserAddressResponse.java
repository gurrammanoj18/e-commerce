package com.voltmart.ecommerce.dto.account;

public record UserAddressResponse(
        Long id,
        String label,
        String recipientName,
        String phone,
        String streetAddress,
        String city,
        String postalCode,
        boolean defaultAddress
) {
}
