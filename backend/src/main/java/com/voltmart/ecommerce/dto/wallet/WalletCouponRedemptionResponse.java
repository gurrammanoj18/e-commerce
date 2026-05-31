package com.voltmart.ecommerce.dto.wallet;

public record WalletCouponRedemptionResponse(
        Long id,
        Long couponId,
        Long userId,
        String userName,
        String userEmail,
        Integer redeemedCount,
        Integer allowedRedemptions,
        Integer remainingRedemptions
) {
}
