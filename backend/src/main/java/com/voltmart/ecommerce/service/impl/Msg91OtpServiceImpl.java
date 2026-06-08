package com.voltmart.ecommerce.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltmart.ecommerce.config.AppProperties;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.service.Msg91OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class Msg91OtpServiceImpl implements Msg91OtpService {
    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;

    @Override
    public boolean isEnabled() {
        return appProperties.getMsg91().isEnabled()
                && StringUtils.hasText(appProperties.getMsg91().getAuthKey())
                && StringUtils.hasText(appProperties.getMsg91().getTemplateId());
    }

    @Override
    public void sendOtp(String phoneNumber) {
        ensureEnabled();
        String mobile = normalizeMobileNumber(phoneNumber);

        try {
            String responseBody = RestClient.builder()
                    .baseUrl(getBaseUrl())
                    .build()
                    .post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v5/otp")
                            .queryParam("template_id", appProperties.getMsg91().getTemplateId())
                            .queryParam("mobile", mobile)
                            .queryParam("authkey", appProperties.getMsg91().getAuthKey())
                            .build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of())
                    .retrieve()
                    .body(String.class);

            validateSendOtpResponse(responseBody);
            log.info("MSG91 send OTP response for mobile ending {}: {}", lastFourDigits(mobile), responseBody);
        } catch (RestClientResponseException exception) {
            throw new BadRequestException(resolveMessage(exception, "Unable to send OTP right now."));
        }
    }

    @Override
    public void verifyOtp(String phoneNumber, String otp) {
        ensureEnabled();
        String mobile = normalizeMobileNumber(phoneNumber);

        try {
            String responseBody = RestClient.builder()
                    .baseUrl(getBaseUrl())
                    .build()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v5/otp/verify")
                            .queryParam("otp", otp)
                            .queryParam("mobile", mobile)
                            .build())
                    .header("authkey", appProperties.getMsg91().getAuthKey())
                    .retrieve()
                    .body(String.class);

            if (responseBody != null && isFailureResponse(responseBody)) {
                throw new BadRequestException(formatFailureMessage(responseBody));
            }
        } catch (RestClientResponseException exception) {
            throw new BadRequestException(resolveMessage(exception, "Unable to verify OTP right now."));
        }
    }

    @Override
    public String verifyWidgetAccessToken(String accessToken) {
        if (!StringUtils.hasText(appProperties.getMsg91().getAuthKey())) {
            throw new BadRequestException("MSG91 auth key is not configured.");
        }
        if (!StringUtils.hasText(accessToken)) {
            throw new BadRequestException("MSG91 access token is missing.");
        }

        try {
            String responseBody = RestClient.builder()
                    .baseUrl(getBaseUrl())
                    .build()
                    .post()
                    .uri("/api/v5/widget/verifyAccessToken")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "authkey", appProperties.getMsg91().getAuthKey(),
                            "access-token", accessToken
                    ))
                    .retrieve()
                    .body(String.class);

            return extractVerifiedPhoneNumber(responseBody);
        } catch (RestClientResponseException exception) {
            throw new BadRequestException(resolveMessage(exception, "Unable to verify MSG91 access token."));
        }
    }

    private void ensureEnabled() {
        if (!isEnabled()) {
            throw new BadRequestException("MSG91 OTP is not configured.");
        }
    }

    private String getBaseUrl() {
        String baseUrl = appProperties.getMsg91().getBaseUrl();
        return StringUtils.hasText(baseUrl) ? baseUrl : "https://control.msg91.com";
    }

    private String normalizeMobileNumber(String phoneNumber) {
        String digitsOnly = phoneNumber == null ? "" : phoneNumber.replaceAll("\\D", "");
        String countryCode = appProperties.getMsg91().getCountryCode();
        String normalizedCountryCode = StringUtils.hasText(countryCode) ? countryCode.replaceAll("\\D", "") : "91";

        if (digitsOnly.startsWith(normalizedCountryCode) && digitsOnly.length() > 10) {
            digitsOnly = digitsOnly.substring(normalizedCountryCode.length());
        }

        if (!digitsOnly.matches("^[6-9][0-9]{9}$")) {
            throw new BadRequestException("Enter a valid 10 digit Indian mobile number.");
        }

        return digitsOnly;
    }

    private String lastFourDigits(String mobile) {
        if (!StringUtils.hasText(mobile)) {
            return "unknown";
        }
        return mobile.length() <= 4 ? mobile : mobile.substring(mobile.length() - 4);
    }

    private String extractVerifiedPhoneNumber(String responseBody) {
        if (!StringUtils.hasText(responseBody)) {
            throw new BadRequestException("MSG91 did not return a verification response.");
        }

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String status = firstText(root, "type", "status");
            String message = firstText(root, "message", "error");
            if (StringUtils.hasText(status) && !"success".equalsIgnoreCase(status)) {
                throw new BadRequestException(StringUtils.hasText(message) ? message : "MSG91 access token verification failed.");
            }

            String phoneNumber = firstText(
                    root,
                    "mobile",
                    "phone",
                    "phoneNumber",
                    "phone_number",
                    "identifier",
                    "number"
            );
            if (!StringUtils.hasText(phoneNumber)) {
                throw new BadRequestException("MSG91 verified the token but did not return a mobile number.");
            }

            String digitsOnly = phoneNumber.replaceAll("\\D", "");
            String countryCode = appProperties.getMsg91().getCountryCode();
            String normalizedCountryCode = StringUtils.hasText(countryCode) ? countryCode.replaceAll("\\D", "") : "91";
            if (digitsOnly.startsWith(normalizedCountryCode) && digitsOnly.length() > 10) {
                digitsOnly = digitsOnly.substring(normalizedCountryCode.length());
            }

            if (digitsOnly.length() != 10) {
                throw new BadRequestException("MSG91 returned an invalid mobile number.");
            }

            return digitsOnly;
        } catch (BadRequestException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new BadRequestException("Unable to read MSG91 verification response.");
        }
    }

    private String firstText(JsonNode root, String... fieldNames) {
        for (String fieldName : fieldNames) {
            String value = findText(root, fieldName);
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }

    private String findText(JsonNode node, String fieldName) {
        if (node == null || node.isNull()) {
            return null;
        }
        JsonNode directValue = node.get(fieldName);
        if (directValue != null && directValue.isValueNode()) {
            return directValue.asText();
        }
        if (node.isObject()) {
            for (JsonNode child : node) {
                String value = findText(child, fieldName);
                if (StringUtils.hasText(value)) {
                    return value;
                }
            }
        }
        if (node.isArray()) {
            for (JsonNode child : node) {
                String value = findText(child, fieldName);
                if (StringUtils.hasText(value)) {
                    return value;
                }
            }
        }
        return null;
    }

    private boolean isFailureResponse(String responseBody) {
        String normalized = responseBody.toLowerCase(Locale.ROOT);
        return normalized.contains("invalid otp")
                || normalized.contains("otp expired")
                || normalized.contains("wrong number")
                || normalized.contains("no number input")
                || normalized.contains("max retry")
                || normalized.contains("invalid auth")
                || normalized.contains("authkey")
                || normalized.contains("template")
                || normalized.contains("sender")
                || normalized.contains("dlt")
                || normalized.contains("balance")
                || normalized.contains("credit")
                || normalized.contains("not valid")
                || normalized.contains("failed");
    }

    private void validateSendOtpResponse(String responseBody) {
        if (!StringUtils.hasText(responseBody)) {
            throw new BadRequestException("MSG91 did not return a send OTP response.");
        }

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String status = firstText(root, "type", "status");
            String message = firstText(root, "message", "error");
            if (StringUtils.hasText(status) && !"success".equalsIgnoreCase(status)) {
                throw new BadRequestException(StringUtils.hasText(message) ? message : "MSG91 rejected the OTP request.");
            }
            if (!StringUtils.hasText(status) && isFailureResponse(responseBody)) {
                throw new BadRequestException(formatFailureMessage(responseBody));
            }
        } catch (BadRequestException exception) {
            throw exception;
        } catch (Exception exception) {
            if (isFailureResponse(responseBody)) {
                throw new BadRequestException(formatFailureMessage(responseBody));
            }
        }
    }

    private String formatFailureMessage(String responseBody) {
        String normalized = responseBody.toLowerCase(Locale.ROOT);
        if (normalized.contains("invalid otp")) {
            return "Invalid OTP.";
        }
        if (normalized.contains("otp expired")) {
            return "OTP expired. Please request a new one.";
        }
        if (normalized.contains("wrong number")) {
            return "Please request a fresh OTP.";
        }
        if (normalized.contains("no number input")) {
            return "Please request a fresh OTP.";
        }
        if (normalized.contains("max retry")) {
            return "Too many incorrect attempts. Please request a new OTP.";
        }
        if (normalized.contains("invalid auth") || normalized.contains("authkey")) {
            return "MSG91 auth key is invalid or not configured correctly.";
        }
        if (normalized.contains("template")) {
            return "MSG91 OTP template is invalid, inactive, or not linked to this account.";
        }
        if (normalized.contains("sender")) {
            return "MSG91 sender ID is not configured or approved for this OTP template.";
        }
        if (normalized.contains("dlt")) {
            return "MSG91 DLT registration/template approval is missing or inactive.";
        }
        if (normalized.contains("balance") || normalized.contains("credit")) {
            return "MSG91 SMS balance or OTP credits are not available.";
        }
        if (normalized.contains("not valid")) {
            return "Enter a valid mobile number.";
        }
        return responseBody.trim().isEmpty() ? "Unable to verify OTP right now." : responseBody.trim();
    }

    private String resolveMessage(RestClientResponseException exception, String fallback) {
        String responseBody = exception.getResponseBodyAsString();
        if (!StringUtils.hasText(responseBody)) {
            return fallback;
        }
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String message = firstText(root, "message", "error");
            if (StringUtils.hasText(message)) {
                return message;
            }
        } catch (Exception ignored) {
            return formatFailureMessage(responseBody);
        }
        return responseBody;
    }
}
