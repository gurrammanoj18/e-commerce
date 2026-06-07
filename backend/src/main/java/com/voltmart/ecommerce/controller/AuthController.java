package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.auth.AuthRequest;
import com.voltmart.ecommerce.dto.auth.AuthResponse;
import com.voltmart.ecommerce.dto.auth.DeliveryPreferenceRequest;
import com.voltmart.ecommerce.dto.auth.GoogleAuthRequest;
import com.voltmart.ecommerce.dto.auth.Msg91WidgetVerifyRequest;
import com.voltmart.ecommerce.dto.auth.OtpRequest;
import com.voltmart.ecommerce.dto.auth.OtpRequestResponse;
import com.voltmart.ecommerce.dto.auth.OtpVerifyRequest;
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

    @PostMapping("/otp/widget/verify")
    public AuthResponse msg91WidgetLogin(@Valid @RequestBody Msg91WidgetVerifyRequest request) {
        return authService.msg91WidgetLogin(request);
    }

    @PostMapping("/otp/request")
    public OtpRequestResponse requestOtp(@Valid @RequestBody OtpRequest request) {
        return authService.requestOtp(request);
    }

    @PostMapping("/otp/verify")
    public AuthResponse verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        return authService.verifyOtp(request);
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
