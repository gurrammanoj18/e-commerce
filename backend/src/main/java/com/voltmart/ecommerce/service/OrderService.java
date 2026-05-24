package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.order.CheckoutRequest;
import com.voltmart.ecommerce.dto.order.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse placeOrder(CheckoutRequest request);
    List<OrderResponse> getCurrentUserOrders();
    List<OrderResponse> getAllOrders();
    OrderResponse updateOrderStatus(Long orderId, String status);
    void deleteOrder(Long orderId);
}
