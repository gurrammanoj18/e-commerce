package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.entity.Order;
import com.voltmart.ecommerce.entity.ReturnRequest;
import com.voltmart.ecommerce.entity.enums.OrderStatus;
import com.voltmart.ecommerce.entity.enums.ReturnRequestStatus;

public interface EmailNotificationService {
    void sendOrderPlacedNotification(Order order);
    void sendOrderStatusUpdateNotification(Order order, OrderStatus previousStatus);
    void sendReturnRequestNotification(ReturnRequest returnRequest);
    void sendReturnRequestStatusUpdateNotification(ReturnRequest returnRequest, ReturnRequestStatus previousStatus);
}
