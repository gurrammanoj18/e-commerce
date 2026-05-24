package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.config.AppProperties;
import com.voltmart.ecommerce.entity.Order;
import com.voltmart.ecommerce.entity.OrderItem;
import com.voltmart.ecommerce.entity.enums.OrderStatus;
import com.voltmart.ecommerce.service.WhatsappNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.text.NumberFormat;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsappNotificationServiceImpl implements WhatsappNotificationService {

    private static final DateTimeFormatter DELIVERY_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);

    private final AppProperties appProperties;

    @Override
    public void sendOrderPlacedNotification(Order order) {
        if (!isConfigured()) {
            return;
        }

        String message = String.join("\n",
                "Hi " + order.getShippingName() + ",",
                "Your order has been placed successfully.",
                "Order ID: " + order.getId(),
                "Order number: " + order.getOrderNumber(),
                "Items: " + buildItemSummary(order.getItems()),
                "Total paid: " + formatCurrency(order.getTotalAmount()),
                "Delivery address: " + order.getShippingAddress() + ", " + order.getCity() + " - " + order.getPostalCode(),
                "It will be delivered by " + DELIVERY_TIME_FORMATTER.format(LocalTime.of(22, 0)) + " today.",
                "Current status: " + toDisplayStatus(order.getStatus()),
                "Thank you for shopping with VoltMart."
        );

        sendTextMessage(order.getPhone(), message, "order placement");
    }

    @Override
    public void sendOrderStatusUpdateNotification(Order order, OrderStatus previousStatus) {
        if (!isConfigured() || previousStatus == order.getStatus()) {
            return;
        }

        String message = String.join("\n",
                "Hi " + order.getShippingName() + ",",
                "Your VoltMart order has a new delivery update.",
                "Order ID: " + order.getId(),
                "Order number: " + order.getOrderNumber(),
                "Previous status: " + toDisplayStatus(previousStatus),
                "Current status: " + toDisplayStatus(order.getStatus()),
                buildStatusDetail(order.getStatus()),
                "Delivery address: " + order.getShippingAddress() + ", " + order.getCity() + " - " + order.getPostalCode(),
                "We'll keep you posted on WhatsApp whenever the status changes."
        );

        sendTextMessage(order.getPhone(), message, "order status update");
    }

    private boolean isConfigured() {
        AppProperties.Whatsapp whatsapp = appProperties.getWhatsapp();
        boolean configured = whatsapp.isEnabled()
                && StringUtils.hasText(whatsapp.getPhoneNumberId())
                && StringUtils.hasText(whatsapp.getAccessToken());

        if (!configured) {
            log.info("WhatsApp notifications are disabled or missing credentials. Skipping send.");
        }

        return configured;
    }

    private void sendTextMessage(String phoneNumber, String message, String eventName) {
        try {
            RestClient restClient = RestClient.builder()
                    .baseUrl("https://graph.facebook.com")
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + appProperties.getWhatsapp().getAccessToken())
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build();

            restClient.post()
                    .uri("/{version}/{phoneNumberId}/messages",
                            appProperties.getWhatsapp().getApiVersion(),
                            appProperties.getWhatsapp().getPhoneNumberId())
                    .body(Map.of(
                            "messaging_product", "whatsapp",
                            "to", normalizePhoneNumber(phoneNumber),
                            "type", "text",
                            "text", Map.of(
                                    "preview_url", false,
                                    "body", message
                            )
                    ))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception exception) {
            log.warn("Unable to send WhatsApp {} for order phone {}: {}",
                    eventName, phoneNumber, exception.getMessage());
        }
    }

    private String normalizePhoneNumber(String phoneNumber) {
        return phoneNumber.replaceAll("[^\\d]", "");
    }

    private String buildItemSummary(List<OrderItem> items) {
        return items.stream()
                .map(item -> item.getProduct().getName() + " x" + item.getQuantity())
                .collect(Collectors.joining(", "));
    }

    private String buildStatusDetail(OrderStatus status) {
        return switch (status) {
            case PENDING -> "We're validating your order and will confirm it shortly.";
            case CONFIRMED -> "Your order is confirmed and scheduled for delivery by 10:00 PM today.";
            case PROCESSING -> "Our team is packing your items and getting them ready for dispatch.";
            case SHIPPED -> "Your order is on the way and is expected to arrive by 10:00 PM today.";
            case DELIVERED -> "Your order has been delivered. We hope you enjoy your purchase.";
            case CANCELLED -> "This order has been cancelled. Please contact support if you need help.";
        };
    }

    private String toDisplayStatus(OrderStatus status) {
        String lowercase = status.name().toLowerCase(Locale.ENGLISH);
        return Character.toUpperCase(lowercase.charAt(0)) + lowercase.substring(1);
    }

    private String formatCurrency(java.math.BigDecimal amount) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        return formatter.format(amount);
    }
}
