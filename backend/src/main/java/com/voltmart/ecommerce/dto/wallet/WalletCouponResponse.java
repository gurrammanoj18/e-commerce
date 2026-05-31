package com.voltmart.ecommerce.dto.wallet;

import com.voltmart.ecommerce.entity.enums.WalletCouponType;

import java.math.BigDecimal;

public record WalletCouponResponse(
        Long id,
        String code,
        WalletCouponType type,
        BigDecimal amount,
        String description,
        String assignedCustomerEmails,
        boolean active,
        Integer rewardDelayMinutes
) {
}
