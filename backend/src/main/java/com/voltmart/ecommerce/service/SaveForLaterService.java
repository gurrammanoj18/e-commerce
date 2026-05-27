package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.cart.SaveForLaterItemRequest;
import com.voltmart.ecommerce.dto.cart.SaveForLaterResponse;

public interface SaveForLaterService {
    SaveForLaterResponse getItemsForCurrentUser();
    SaveForLaterResponse addItem(SaveForLaterItemRequest request);
    SaveForLaterResponse removeItem(Long itemId);
}
