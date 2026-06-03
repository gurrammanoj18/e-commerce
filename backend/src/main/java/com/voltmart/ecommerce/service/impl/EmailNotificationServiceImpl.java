package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.config.AppProperties;
import com.voltmart.ecommerce.entity.Order;
import com.voltmart.ecommerce.entity.OrderItem;
import com.voltmart.ecommerce.entity.ReturnRequest;
import com.voltmart.ecommerce.entity.enums.OrderStatus;
import com.voltmart.ecommerce.entity.enums.ReturnRequestStatus;
import com.voltmart.ecommerce.entity.enums.ReturnRequestType;
import com.voltmart.ecommerce.service.EmailNotificationService;
import jakarta.mail.internet.InternetAddress;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.text.NumberFormat;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationServiceImpl implements EmailNotificationService {

    private static final DateTimeFormatter DELIVERY_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Override
    public void sendOrderPlacedNotification(Order order) {
        if (!isConfigured()) {
            return;
        }

        String subject = "VoltMart order placed: #" + order.getId();
        String html = buildEmailTemplate(
                order,
                "Your order has been placed!",
                "Delivered by " + DELIVERY_TIME_FORMATTER.format(LocalTime.of(22, 0)) + " today",
                "We're preparing your package and will keep you updated at every step.",
                buildStatusDetail(order.getStatus()),
                "Track package",
                buildWhatsappTrackingUrl(order),
                "Buy again",
                "/products"
        );

        sendEmail(order.getEmail(), subject, html, "order placement");
    }

    @Override
    public void sendOrderStatusUpdateNotification(Order order, OrderStatus previousStatus) {
        if (!isConfigured() || previousStatus == order.getStatus()) {
            return;
        }

        String subject = "VoltMart delivery update: #" + order.getId() + " is " + toDisplayStatus(order.getStatus());
        String html = buildEmailTemplate(
                order,
                buildStatusHeadline(order.getStatus()),
                buildStatusSubheadline(order.getStatus()),
                "Previous status: " + toDisplayStatus(previousStatus),
                buildStatusDetail(order.getStatus()),
                "Track package",
                buildWhatsappTrackingUrl(order),
                "Contact support",
                buildWhatsappTrackingUrl(order)
        );

        sendEmail(order.getEmail(), subject, html, "order status update");
    }

    @Override
    public void sendReturnRequestNotification(ReturnRequest returnRequest) {
        if (!isConfigured()) {
            return;
        }

        try {
            String subject = "VoltMart return request: #" + returnRequest.getOrder().getId();
            String html = buildSupportEmailTemplate(
                    returnRequest,
                    buildRequestHeadline(returnRequest.getRequestType(), returnRequest.getStatus()),
                    buildRequestSubheadline(returnRequest.getRequestType(), returnRequest.getStatus()),
                    "Requested on " + returnRequest.getCreatedAt(),
                    buildRequestDetail(returnRequest.getRequestType(), returnRequest.getStatus())
            );

            sendEmail(returnRequest.getOrder().getEmail(), subject, html, "return request");
        } catch (Exception exception) {
            log.warn("Unable to prepare return request email for order {}: {}",
                    returnRequest.getOrder().getOrderNumber(), exception.getMessage());
        }
    }

    @Override
    public void sendReturnRequestStatusUpdateNotification(ReturnRequest returnRequest, ReturnRequestStatus previousStatus) {
        if (!isConfigured() || previousStatus == returnRequest.getStatus()) {
            return;
        }

        try {
            String subject = "VoltMart return update: #" + returnRequest.getOrder().getId() + " is " +
                    toDisplayStatus(returnRequest.getStatus());
            String html = buildSupportEmailTemplate(
                    returnRequest,
                    buildRequestHeadline(returnRequest.getRequestType(), returnRequest.getStatus()),
                    buildRequestSubheadline(returnRequest.getRequestType(), returnRequest.getStatus()),
                    "Previous status: " + toDisplayStatus(previousStatus),
                    buildRequestDetail(returnRequest.getRequestType(), returnRequest.getStatus())
            );

            sendEmail(returnRequest.getOrder().getEmail(), subject, html, "return status update");
        } catch (Exception exception) {
            log.warn("Unable to prepare return status email for order {}: {}",
                    returnRequest.getOrder().getOrderNumber(), exception.getMessage());
        }
    }

    private boolean isConfigured() {
        AppProperties.Email email = appProperties.getEmail();
        boolean senderConfigured = email.isEnabled() && StringUtils.hasText(email.getFromAddress());
        boolean configured = senderConfigured && (isBrevoConfigured()
                ? StringUtils.hasText(email.getApiKey()) && StringUtils.hasText(email.getApiUrl())
                : StringUtils.hasText(mailHost)
                        && StringUtils.hasText(mailUsername)
                        && StringUtils.hasText(mailPassword));

        if (!configured) {
            log.info(
                    "Email notifications are disabled or missing provider details. provider={}, enabled={}, fromAddressSet={}, apiKeySet={}, apiUrlSet={}, mailHostSet={}, mailUsernameSet={}, mailPasswordSet={}",
                    email.getProvider(),
                    email.isEnabled(),
                    StringUtils.hasText(email.getFromAddress()),
                    StringUtils.hasText(email.getApiKey()),
                    StringUtils.hasText(email.getApiUrl()),
                    StringUtils.hasText(mailHost),
                    StringUtils.hasText(mailUsername),
                    StringUtils.hasText(mailPassword)
            );
        }

        return configured;
    }

    private void sendEmail(String recipient, String subject, String htmlBody, String eventName) {
        if (isBrevoConfigured()) {
            sendBrevoEmail(recipient, subject, htmlBody, eventName);
            return;
        }

        sendSmtpEmail(recipient, subject, htmlBody, eventName);
    }

    private void sendSmtpEmail(String recipient, String subject, String htmlBody, String eventName) {
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setTo(recipient);
            helper.setFrom(new InternetAddress(
                    appProperties.getEmail().getFromAddress(),
                    appProperties.getEmail().getFromName()
            ));
            helper.setSubject(subject);
            helper.setText(buildPlainTextFallback(subject, htmlBody), htmlBody);
            mailSender.send(message);
        } catch (Exception exception) {
            log.warn("Unable to send email {} to {}: {}", eventName, recipient, exception.getMessage());
        }
    }

    private void sendBrevoEmail(String recipient, String subject, String htmlBody, String eventName) {
        AppProperties.Email email = appProperties.getEmail();
        try {
            RestClient.create()
                    .post()
                    .uri(email.getApiUrl())
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("api-key", email.getApiKey())
                    .body(Map.of(
                            "sender", Map.of(
                                    "email", email.getFromAddress(),
                                    "name", email.getFromName()
                            ),
                            "to", List.of(Map.of("email", recipient)),
                            "subject", subject,
                            "htmlContent", htmlBody,
                            "textContent", buildPlainTextFallback(subject, htmlBody)
                    ))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception exception) {
            log.warn("Unable to send email {} to {} through Brevo API: {}", eventName, recipient, exception.getMessage());
        }
    }

    private boolean isBrevoConfigured() {
        return "brevo".equalsIgnoreCase(appProperties.getEmail().getProvider());
    }

    private String buildEmailTemplate(
            Order order,
            String headline,
            String subheadline,
            String metaNote,
            String detailMessage,
            String primaryActionLabel,
            String primaryActionUrl,
            String secondaryActionLabel,
            String secondaryActionUrl
    ) {
        return buildNotificationEmailTemplate(
                order.getShippingName(),
                headline,
                subheadline,
                metaNote,
                detailMessage,
                "Order update",
                order.getShippingName() + " - " + order.getCity().toUpperCase(Locale.ENGLISH),
                "Order #",
                order.getOrderNumber().toString(),
                toDisplayStatus(order.getStatus()),
                buildItemSummary(order.getItems()),
                formatCurrency(order.getTotalAmount()),
                order.getShippingAddress() + ", " + order.getCity() + " - " + order.getPostalCode(),
                order.getPhone()
        );
    }

    private String buildSupportEmailTemplate(
            ReturnRequest returnRequest,
            String headline,
            String subheadline,
            String metaNote,
            String detailMessage
    ) {
        return buildNotificationEmailTemplate(
                returnRequest.getUser().getFullName(),
                headline,
                subheadline,
                metaNote,
                detailMessage,
                returnRequest.getRequestType() == ReturnRequestType.REPLACEMENT ? "Replacement update" : "Return update",
                returnRequest.getOrder().getShippingName() + " - " + returnRequest.getOrder().getCity().toUpperCase(Locale.ENGLISH),
                "Order #",
                returnRequest.getOrder().getOrderNumber().toString(),
                returnRequest.getRequestType() == ReturnRequestType.REPLACEMENT
                        ? "Replacement request"
                        : "Return request",
                buildItemSummary(returnRequest.getOrder().getItems()),
                formatCurrency(returnRequest.getOrder().getTotalAmount()),
                returnRequest.getOrder().getShippingAddress() + ", " + returnRequest.getOrder().getCity() + " - " + returnRequest.getOrder().getPostalCode(),
                returnRequest.getOrder().getPhone()
        );
    }

    private String buildNotificationEmailTemplate(
            String recipientName,
            String headline,
            String subheadline,
            String metaNote,
            String detailMessage,
            String customerLine,
            String locationLine,
            String referenceLabel,
            String referenceNumber,
            String status,
            String itemSummary,
            String amount,
            String deliveryAddress,
            String phone
    ) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                  <body style="margin:0;padding:0;background:#111318;font-family:Arial,sans-serif;color:#f3f4f6;">
                    <div style="padding:24px 12px;background:#111318;">
                      <div style="max-width:760px;margin:0 auto;border-radius:28px;overflow:hidden;background:#1a1d24;border:1px solid #2a2f39;">
                        <div style="background:#243447;padding:18px 24px;text-align:center;">
                          <span style="display:inline-block;color:#f8fafc;font-size:14px;font-weight:700;margin:0 18px;">VoltMart</span>
                          <span style="display:inline-block;color:#d7dde8;font-size:14px;font-weight:700;margin:0 18px;">Your Account</span>
                          <span style="display:inline-block;color:#d7dde8;font-size:14px;font-weight:700;margin:0 18px;">Support</span>
                        </div>
                        <div style="padding:28px 28px 20px;">
                          <p style="margin:0 0 8px;font-size:14px;color:#d7dde8;">Hi %s,</p>
                          <h1 style="margin:0 0 18px;font-size:34px;line-height:1.15;color:#ffffff;">%s</h1>
                          <div style="border-top:1px solid #343a46;margin-bottom:24px;"></div>
                          <p style="margin:0;color:#f8fafc;font-size:28px;line-height:1.2;font-weight:700;">%s</p>
                          <p style="margin:8px 0 22px;color:#cbd5e1;font-size:18px;line-height:1.4;">%s</p>
                          <div style="background:#232833;border-radius:20px;padding:22px;margin-bottom:20px;">
                            <p style="margin:0 0 12px;color:#9ca3af;font-size:13px;text-transform:uppercase;letter-spacing:.08em;">%s</p>
                            <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#ffffff;">%s</p>
                            <p style="margin:0 0 6px;font-size:16px;color:#d1d5db;">%s</p>
                            <p style="margin:0;font-size:16px;color:#e5e7eb;">%s %s</p>
                          </div>
                          <div style="background:#171a20;border:1px solid #303645;border-radius:20px;padding:22px;margin-bottom:20px;">
                            <p style="margin:0 0 10px;color:#f9fafb;font-size:18px;font-weight:700;">Details</p>
                            <p style="margin:0 0 8px;color:#d1d5db;font-size:15px;">Status: %s</p>
                            <p style="margin:0 0 8px;color:#d1d5db;font-size:15px;">Items: %s</p>
                            <p style="margin:0 0 8px;color:#d1d5db;font-size:15px;">Amount: %s</p>
                            <p style="margin:0 0 8px;color:#d1d5db;font-size:15px;">Deliver to: %s</p>
                            <p style="margin:0;color:#d1d5db;font-size:15px;">Phone: %s</p>
                          </div>
                          <div style="background:#262b31;border-radius:18px;padding:16px 18px;margin-top:22px;">
                            <p style="margin:0;color:#d1d5db;font-size:15px;">%s</p>
                          </div>
                        </div>
                        <div style="padding:24px 28px;background:#20242b;">
                          <p style="margin:0 0 12px;color:#cbd5e1;font-size:14px;">%s</p>
                          <p style="margin:0;color:#9ca3af;font-size:13px;">© 2026 VoltMart. Order notifications and delivery updates.</p>
                        </div>
                      </div>
                    </div>
                  </body>
                </html>
                """.formatted(
                escapeHtml(recipientName),
                escapeHtml(headline),
                escapeHtml(subheadline),
                escapeHtml(metaNote),
                escapeHtml(customerLine),
                escapeHtml(locationLine),
                escapeHtml(status),
                escapeHtml(referenceLabel),
                escapeHtml(referenceNumber),
                escapeHtml(status),
                escapeHtml(itemSummary),
                escapeHtml(amount),
                escapeHtml(deliveryAddress),
                escapeHtml(phone),
                escapeHtml(detailMessage),
                escapeHtml(appProperties.getEmail().getFromName())
        );
    }

    private String buildRequestHeadline(ReturnRequestType requestType, ReturnRequestStatus status) {
        if (requestType == ReturnRequestType.REPLACEMENT) {
            return status == ReturnRequestStatus.REQUESTED || status == ReturnRequestStatus.UNDER_REVIEW
                    ? "Your replacement request is received"
                    : "Your replacement request is updated";
        }

        return status == ReturnRequestStatus.REQUESTED
                || status == ReturnRequestStatus.CONFIRMED
                || status == ReturnRequestStatus.APPROVED
                || status == ReturnRequestStatus.UNDER_REVIEW
                ? "Your return request is received"
                : "Your return request is updated";
    }

    private String buildRequestSubheadline(ReturnRequestType requestType, ReturnRequestStatus status) {
        String label = requestType == ReturnRequestType.REPLACEMENT ? "replacement" : "return";
        return switch (status) {
            case REQUESTED, CONFIRMED, APPROVED, UNDER_REVIEW -> "We are reviewing your " + label + " request now";
            case READY_TO_PICKUP -> "Pickup has been arranged for your " + label + " request";
            case PICKUP_SCHEDULED -> "Pickup is scheduled for your " + label + " request";
            case PICKED_UP -> "Your item has been collected for inspection";
            case SHIPPED -> "Your replacement is on the way";
            case DELIVERED -> "Your replacement was delivered successfully";
            case REFUNDED -> "Your refund has been completed";
            case REJECTED -> "This " + label + " request is no longer active";
            case CLOSED -> "This " + label + " request has been closed";
        };
    }

    private String buildRequestDetail(ReturnRequestType requestType, ReturnRequestStatus status) {
        String label = requestType == ReturnRequestType.REPLACEMENT ? "replacement" : "return";
        return switch (status) {
            case REQUESTED, CONFIRMED, APPROVED, UNDER_REVIEW -> "Our support team will review your " + label + " request and update you shortly.";
            case READY_TO_PICKUP -> "Pickup has been arranged and the pickup team will contact you soon.";
            case PICKUP_SCHEDULED -> "Your pickup is scheduled and we will keep you posted before the visit.";
            case PICKED_UP -> "Your item has been collected and is now being inspected.";
            case SHIPPED -> "Your replacement item is on the way.";
            case DELIVERED -> "Your replacement item has been delivered.";
            case REFUNDED -> "The refund has been completed for your order.";
            case REJECTED -> "This request was rejected by support. Please contact us if you need help.";
            case CLOSED -> "This request has been closed by support.";
        };
    }

    private String buildPlainTextFallback(String subject, String htmlBody) {
        return subject + "\n\n" + htmlBody.replaceAll("<[^>]*>", " ").replace("&nbsp;", " ").replaceAll("\\s+", " ").trim();
    }

    private String buildStatusHeadline(OrderStatus status) {
        return switch (status) {
            case CONFIRMED -> "Your order is confirmed";
            case PROCESSING -> "Your package is being packed";
            case SHIPPED -> "Your package is on the way";
            case DELIVERED -> "Your package was delivered!";
            case CANCELLED -> "Your order was cancelled";
        };
    }

    private String buildStatusSubheadline(OrderStatus status) {
        return switch (status) {
            case CONFIRMED -> "Delivery is scheduled by " + DELIVERY_TIME_FORMATTER.format(LocalTime.of(22, 0)) + " today";
            case PROCESSING -> "Our team is getting everything ready for dispatch";
            case SHIPPED -> "Expected delivery by " + DELIVERY_TIME_FORMATTER.format(LocalTime.of(22, 0)) + " today";
            case DELIVERED -> "Package was handed over successfully";
            case CANCELLED -> "This order is no longer active";
        };
    }

    private String buildWhatsappTrackingUrl(Order order) {
        String message = "Track order " + order.getOrderNumber() + " - status: " + order.getStatus();
        return "https://wa.me/" + appProperties.getWhatsapp().getSupportNumber() + "?text=" +
                URLEncoder.encode(message, StandardCharsets.UTF_8);
    }

    private String resolveStoreUrl(String path) {
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        String frontendUrl = appProperties.getStore().getFrontendUrl();
        return frontendUrl.replaceAll("/+$", "") + path;
    }

    private String buildItemSummary(List<OrderItem> items) {
        return items.stream()
                .map(item -> item.getProduct().getName() + " x" + item.getQuantity())
                .collect(Collectors.joining(", "));
    }

    private String buildStatusDetail(OrderStatus status) {
        return switch (status) {
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

    private String toDisplayStatus(ReturnRequestStatus status) {
        String lowercase = status.name().toLowerCase(Locale.ENGLISH);
        return Character.toUpperCase(lowercase.charAt(0)) + lowercase.substring(1).replace('_', ' ');
    }

    private String formatCurrency(java.math.BigDecimal amount) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        return formatter.format(amount);
    }

    private String escapeHtml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
