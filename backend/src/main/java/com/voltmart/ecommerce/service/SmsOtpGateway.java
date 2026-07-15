package com.voltmart.ecommerce.service;

public interface SmsOtpGateway {
    void sendOtp(String phoneNumber, String message);
}
