package com.voltmart.ecommerce.dto.wallet;

import com.voltmart.ecommerce.entity.enums.WalletCouponType;
import com.voltmart.ecommerce.entity.enums.WalletCouponRedemptionFrequency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record WalletCouponRequest(
        @NotBlank String code,
        @NotNull WalletCouponType type,
        @NotNull BigDecimal amount,
        Integer discountPercentage,
        String description,
        String assignedCustomerEmails,
        boolean active,
        Integer rewardDelayMinutes,
        WalletCouponRedemptionFrequency redemptionFrequency
) {
}
