package com.voltmart.ecommerce.dto.cart;

import java.util.List;

public record SaveForLaterResponse(
        List<SaveForLaterItemResponse> items,
        int itemCount
) {
}
