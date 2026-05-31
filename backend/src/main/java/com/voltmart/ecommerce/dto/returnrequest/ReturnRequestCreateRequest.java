package com.voltmart.ecommerce.dto.returnrequest;

import com.voltmart.ecommerce.entity.enums.ReturnResolution;
import com.voltmart.ecommerce.entity.enums.ReturnRequestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReturnRequestCreateRequest(
        @NotNull Long orderId,
        @NotNull ReturnRequestType requestType,
        @NotBlank String reason,
        @NotBlank String description,
        @NotNull ReturnResolution preferredResolution
) {
}
