package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.order.CheckoutRequest;
import com.voltmart.ecommerce.dto.order.OrderResponse;
import com.voltmart.ecommerce.entity.Order;
import com.voltmart.ecommerce.entity.OrderItem;
import com.voltmart.ecommerce.entity.enums.OrderStatus;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.mapper.EntityMapper;
import com.voltmart.ecommerce.repository.CartRepository;
import com.voltmart.ecommerce.repository.InventoryRepository;
import com.voltmart.ecommerce.repository.OrderRepository;
import com.voltmart.ecommerce.service.CurrentUserService;
import com.voltmart.ecommerce.service.EmailNotificationService;
import com.voltmart.ecommerce.service.OrderService;
import com.voltmart.ecommerce.service.WhatsappNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final CurrentUserService currentUserService;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final EntityMapper entityMapper;
    private final WhatsappNotificationService whatsappNotificationService;
    private final EmailNotificationService emailNotificationService;

    @Override
    @Transactional
    public OrderResponse placeOrder(CheckoutRequest request) {
        var user = currentUserService.getCurrentUser();
        var cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        BigDecimal subtotal = cart.getItems().stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal shipping = subtotal.compareTo(BigDecimal.valueOf(4999)) >= 0 ? BigDecimal.ZERO : BigDecimal.valueOf(499);
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.18));
        BigDecimal total = subtotal.add(shipping).add(tax);

        Order order = Order.builder()
                .orderNumber(UUID.randomUUID())
                .user(user)
                .status(OrderStatus.PENDING)
                .shippingName(request.shippingName())
                .email(request.email())
                .phone(request.phone())
                .shippingAddress(request.shippingAddress())
                .city(request.city())
                .postalCode(request.postalCode())
                .subtotal(subtotal)
                .shippingCost(shipping)
                .taxAmount(tax)
                .totalAmount(total)
                .createdAt(LocalDateTime.now())
                .build();

        List<OrderItem> orderItems = cart.getItems().stream().map(item -> {
            var inventory = inventoryRepository.findByProductId(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
            if (inventory.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for " + item.getProduct().getName());
            }
            inventory.setStockQuantity(inventory.getStockQuantity() - item.getQuantity());
            inventory.setUpdatedAt(LocalDateTime.now());
            inventoryRepository.save(inventory);
            return OrderItem.builder()
                    .order(order)
                    .product(item.getProduct())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getProduct().getPrice())
                    .build();
        }).toList();

        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);
        cart.getItems().clear();
        cartRepository.save(cart);
        whatsappNotificationService.sendOrderPlacedNotification(savedOrder);
        emailNotificationService.sendOrderPlacedNotification(savedOrder);
        return entityMapper.toOrderResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getCurrentUserOrders() {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUserService.getCurrentUser().getId()).stream()
                .map(entityMapper::toOrderResponse)
                .toList();
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(entityMapper::toOrderResponse).toList();
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        Order savedOrder = orderRepository.save(order);
        whatsappNotificationService.sendOrderStatusUpdateNotification(savedOrder, previousStatus);
        emailNotificationService.sendOrderStatusUpdateNotification(savedOrder, previousStatus);
        return entityMapper.toOrderResponse(savedOrder);
    }

    @Override
    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        orderRepository.delete(order);
    }
}
