package com.voltmart.ecommerce.dto.wallet;

import jakarta.validation.constraints.NotBlank;

public record WalletRedeemRequest(
        @NotBlank String code
) {
}
