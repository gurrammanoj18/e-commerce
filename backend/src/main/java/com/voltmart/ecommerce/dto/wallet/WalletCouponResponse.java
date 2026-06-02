package com.voltmart.ecommerce.dto.wallet;

import com.voltmart.ecommerce.entity.enums.WalletCouponType;
import com.voltmart.ecommerce.entity.enums.WalletCouponRedemptionFrequency;

import java.math.BigDecimal;

public record WalletCouponResponse(
        Long id,
        String code,
        WalletCouponType type,
        BigDecimal amount,
        Integer discountPercentage,
        String description,
        String assignedCustomerEmails,
        boolean active,
        Integer rewardDelayMinutes,
        WalletCouponRedemptionFrequency redemptionFrequency
) {
}
