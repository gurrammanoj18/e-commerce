package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.config.AppProperties;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.service.Msg91OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class Msg91OtpServiceImpl implements Msg91OtpService {
    private final AppProperties appProperties;

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
            RestClient.builder()
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

        if (digitsOnly.startsWith(normalizedCountryCode)) {
            return digitsOnly;
        }

        if (digitsOnly.length() == 10) {
            return normalizedCountryCode + digitsOnly;
        }

        return digitsOnly;
    }

    private boolean isFailureResponse(String responseBody) {
        String normalized = responseBody.toLowerCase(Locale.ROOT);
        return normalized.contains("invalid otp")
                || normalized.contains("otp expired")
                || normalized.contains("wrong number")
                || normalized.contains("no number input")
                || normalized.contains("max retry");
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
        return responseBody.trim().isEmpty() ? "Unable to verify OTP right now." : responseBody.trim();
    }

    private String resolveMessage(RestClientResponseException exception, String fallback) {
        String responseBody = exception.getResponseBodyAsString();
        return StringUtils.hasText(responseBody) ? responseBody : fallback;
    }
}
