package com.voltmart.ecommerce.dto.wallet;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record WalletCouponGrantRequest(
        @NotNull Long userId,
        @NotNull @Min(1) Integer additionalRedemptions
) {
}
