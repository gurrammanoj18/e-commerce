package com.voltmart.ecommerce.service;

public interface Msg91OtpService {
    boolean isEnabled();

    void sendOtp(String phoneNumber);

    void verifyOtp(String phoneNumber, String otp);
}
