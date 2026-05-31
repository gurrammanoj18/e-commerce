package com.voltmart.ecommerce.dto.wallet;

import com.voltmart.ecommerce.entity.enums.WalletCouponType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record WalletCouponRequest(
        @NotBlank String code,
        @NotNull WalletCouponType type,
        @NotNull BigDecimal amount,
        String description,
        String assignedCustomerEmails,
        boolean active,
        Integer rewardDelayMinutes
) {
}
