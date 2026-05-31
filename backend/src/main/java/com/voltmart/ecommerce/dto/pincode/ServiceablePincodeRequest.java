package com.voltmart.ecommerce.dto.pincode;

import jakarta.validation.constraints.NotBlank;

public record ServiceablePincodeRequest(
        @NotBlank String pincode,
        String label,
        Boolean active
) {
}
