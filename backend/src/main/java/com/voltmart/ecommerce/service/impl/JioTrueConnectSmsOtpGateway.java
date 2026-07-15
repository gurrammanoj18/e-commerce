package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.config.AppProperties;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.service.SmsOtpGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class JioTrueConnectSmsOtpGateway implements SmsOtpGateway {

    private final AppProperties appProperties;

    @Override
    public void sendOtp(String phoneNumber, String message) {
        AppProperties.SmsOtp smsOtp = appProperties.getSmsOtp();
        if (!smsOtp.isEnabled()) {
            throw new BadRequestException("OTP login is not configured. Add the Jio TrueConnect settings.");
        }
        if (!StringUtils.hasText(smsOtp.getRequestUrl())) {
            throw new BadRequestException("OTP login request URL is missing.");
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("phoneNumber", phoneNumber);
        payload.put("mobile", phoneNumber);
        payload.put("message", message);
        payload.put("senderId", smsOtp.getSenderId());
        payload.put("templateId", smsOtp.getTemplateId());

        var request = RestClient.builder()
                .build()
                .post()
                .uri(smsOtp.getRequestUrl())
                .contentType(MediaType.APPLICATION_JSON);

        if (StringUtils.hasText(smsOtp.getAuthHeaderName()) && StringUtils.hasText(smsOtp.getAuthHeaderValue())) {
            request = request.header(smsOtp.getAuthHeaderName(), smsOtp.getAuthHeaderValue());
        }

        try {
            request.body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException exception) {
            throw new BadRequestException("Unable to send OTP right now.");
        }
    }
}
