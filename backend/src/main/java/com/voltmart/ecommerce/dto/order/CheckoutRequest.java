package com.voltmart.ecommerce.dto.order;

import com.voltmart.ecommerce.entity.enums.DeliveryMode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(
        @NotNull DeliveryMode deliveryMode,
        String shippingName,
        @Email String email,
        String phone,
        Long addressId,
        String shippingAddress,
        String city,
        String postalCode,
        String deliverySlot,
        String couponCode,
        boolean useWalletBalance,
        boolean priorityOrder,
        String priorityNotes
) {
}
