package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.auth.AuthRequest;
import com.voltmart.ecommerce.dto.auth.AuthResponse;
import com.voltmart.ecommerce.dto.auth.DeliveryPreferenceRequest;
import com.voltmart.ecommerce.dto.auth.GoogleClientIdResponse;
import com.voltmart.ecommerce.dto.auth.GoogleAuthRequest;
import com.voltmart.ecommerce.dto.auth.PhoneOtpRequest;
import com.voltmart.ecommerce.dto.auth.PhoneOtpRequestResponse;
import com.voltmart.ecommerce.dto.auth.PhoneOtpVerifyRequest;
import com.voltmart.ecommerce.dto.auth.ProfileCompletionRequest;
import com.voltmart.ecommerce.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/admin/login")
    public AuthResponse adminLogin(@Valid @RequestBody AuthRequest request) {
        return authService.adminLogin(request);
    }

    @PostMapping("/google")
    public AuthResponse googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        return authService.googleLogin(request);
    }

    @PostMapping("/otp/request")
    public PhoneOtpRequestResponse requestPhoneOtp(@Valid @RequestBody PhoneOtpRequest request) {
        return authService.requestPhoneOtp(request);
    }

    @PostMapping("/otp/verify")
    public AuthResponse verifyPhoneOtp(@Valid @RequestBody PhoneOtpVerifyRequest request) {
        return authService.verifyPhoneOtp(request);
    }

    @GetMapping("/google/client-id")
    public GoogleClientIdResponse googleClientId() {
        return authService.getGoogleClientId();
    }

    @PatchMapping("/profile")
    public AuthResponse completeProfile(@Valid @RequestBody ProfileCompletionRequest request) {
        return authService.completeProfile(request);
    }

    @PatchMapping("/delivery-preference")
    public AuthResponse updateDeliveryPreference(@Valid @RequestBody DeliveryPreferenceRequest request) {
        return authService.updateDeliveryPreference(request);
    }
}
