package com.voltmart.ecommerce.dto.wallet;

import com.voltmart.ecommerce.entity.enums.WalletTransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WalletTransactionResponse(
        Long id,
        WalletTransactionType type,
        BigDecimal amount,
        String description,
        String referenceCode,
        LocalDateTime createdAt
) {
}
