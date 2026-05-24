package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.order.CheckoutRequest;
import com.voltmart.ecommerce.dto.order.OrderResponse;
import com.voltmart.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public OrderResponse checkout(@Valid @RequestBody CheckoutRequest request) {
        return orderService.placeOrder(request);
    }

    @GetMapping
    public List<OrderResponse> getOrders() {
        return orderService.getCurrentUserOrders();
    }
}
