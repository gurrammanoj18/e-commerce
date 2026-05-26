package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.entity.Order;
import com.voltmart.ecommerce.entity.enums.OrderStatus;

public interface EmailNotificationService {
    void sendLoginOtp(String email, String otpCode);
    void sendOrderPlacedNotification(Order order);
    void sendOrderStatusUpdateNotification(Order order, OrderStatus previousStatus);
}
