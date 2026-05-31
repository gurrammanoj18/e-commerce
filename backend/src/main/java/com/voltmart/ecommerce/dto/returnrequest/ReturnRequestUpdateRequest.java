package com.voltmart.ecommerce.dto.returnrequest;

import com.voltmart.ecommerce.entity.enums.ReturnRequestStatus;
import jakarta.validation.constraints.NotNull;

public record ReturnRequestUpdateRequest(
        @NotNull ReturnRequestStatus status,
        String adminNote
) {
}
