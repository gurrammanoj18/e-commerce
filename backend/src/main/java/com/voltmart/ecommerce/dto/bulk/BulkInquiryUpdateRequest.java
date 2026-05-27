package com.voltmart.ecommerce.dto.bulk;

import java.math.BigDecimal;

public record BulkInquiryUpdateRequest(
        String quoteStatus,
        String adminNotes,
        BigDecimal estimatedTotal,
        boolean priorityRequest
) {
}
