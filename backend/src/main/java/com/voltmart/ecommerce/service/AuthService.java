package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.auth.AuthRequest;
import com.voltmart.ecommerce.dto.auth.AuthResponse;
import com.voltmart.ecommerce.dto.auth.GoogleAuthRequest;
import com.voltmart.ecommerce.dto.auth.OtpChallengeResponse;
import com.voltmart.ecommerce.dto.auth.OtpRequest;
import com.voltmart.ecommerce.dto.auth.OtpVerifyRequest;

public interface AuthService {
    AuthResponse adminLogin(AuthRequest request);
    AuthResponse googleLogin(GoogleAuthRequest request);
    OtpChallengeResponse requestOtp(OtpRequest request);
    AuthResponse verifyOtp(OtpVerifyRequest request);
}
