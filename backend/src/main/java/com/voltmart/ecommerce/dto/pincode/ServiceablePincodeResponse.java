package com.voltmart.ecommerce.dto.pincode;

public record ServiceablePincodeResponse(
        Long id,
        String pincode,
        String label,
        boolean active
) {
}
