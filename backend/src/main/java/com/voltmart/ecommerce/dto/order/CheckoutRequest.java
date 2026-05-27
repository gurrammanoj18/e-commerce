package com.voltmart.ecommerce.dto.order;

import com.voltmart.ecommerce.entity.enums.DeliveryMode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(
        @NotNull DeliveryMode deliveryMode,
        @NotBlank String shippingName,
        @Email @NotBlank String email,
        @NotBlank String phone,
        Long addressId,
        String shippingAddress,
        String city,
        String postalCode,
        String deliverySlot,
        boolean priorityOrder,
        String priorityNotes
) {
}
