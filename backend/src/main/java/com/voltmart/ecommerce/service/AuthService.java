package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.auth.AuthRequest;
import com.voltmart.ecommerce.dto.auth.AuthResponse;
import com.voltmart.ecommerce.dto.auth.ForgotPasswordRequest;
import com.voltmart.ecommerce.dto.auth.SignupRequest;
import com.voltmart.ecommerce.dto.common.ApiResponse;

public interface AuthService {
    AuthResponse signup(SignupRequest request);
    AuthResponse login(AuthRequest request);
    ApiResponse forgotPassword(ForgotPasswordRequest request);
}
