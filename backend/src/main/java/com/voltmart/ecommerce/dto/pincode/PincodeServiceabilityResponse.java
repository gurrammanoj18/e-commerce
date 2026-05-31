package com.voltmart.ecommerce.dto.pincode;

public record PincodeServiceabilityResponse(
        String pincode,
        boolean serviceable,
        String message
) {
}
