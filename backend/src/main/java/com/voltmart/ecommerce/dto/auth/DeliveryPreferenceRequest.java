package com.voltmart.ecommerce.dto.auth;

import com.voltmart.ecommerce.entity.enums.DeliveryMode;
import jakarta.validation.constraints.NotNull;

public record DeliveryPreferenceRequest(
        @NotNull DeliveryMode preferredDeliveryMode
) {
}
