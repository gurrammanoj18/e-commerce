package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.cart.SaveForLaterItemRequest;
import com.voltmart.ecommerce.dto.cart.SaveForLaterResponse;
import com.voltmart.ecommerce.service.SaveForLaterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/save-for-later")
@RequiredArgsConstructor
public class SaveForLaterController {

    private final SaveForLaterService saveForLaterService;

    @GetMapping
    public SaveForLaterResponse getItems() {
        return saveForLaterService.getItemsForCurrentUser();
    }

    @PostMapping
    public SaveForLaterResponse addItem(@Valid @RequestBody SaveForLaterItemRequest request) {
        return saveForLaterService.addItem(request);
    }

    @DeleteMapping("/{itemId}")
    public SaveForLaterResponse removeItem(@PathVariable Long itemId) {
        return saveForLaterService.removeItem(itemId);
    }
}
