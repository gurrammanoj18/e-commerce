package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.entity.Order;
import com.voltmart.ecommerce.entity.enums.OrderStatus;

public interface WhatsappNotificationService {
    void sendOtpNotification(String phoneNumber, String otpCode);
    void sendOrderPlacedNotification(Order order);
    void sendOrderStatusUpdateNotification(Order order, OrderStatus previousStatus);
}
