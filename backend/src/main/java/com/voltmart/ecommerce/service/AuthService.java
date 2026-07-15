package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.auth.AuthRequest;
import com.voltmart.ecommerce.dto.auth.AuthResponse;
import com.voltmart.ecommerce.dto.auth.DeliveryPreferenceRequest;
import com.voltmart.ecommerce.dto.auth.GoogleClientIdResponse;
import com.voltmart.ecommerce.dto.auth.GoogleAuthRequest;
import com.voltmart.ecommerce.dto.auth.PhoneOtpRequest;
import com.voltmart.ecommerce.dto.auth.PhoneOtpRequestResponse;
import com.voltmart.ecommerce.dto.auth.PhoneOtpVerifyRequest;
import com.voltmart.ecommerce.dto.auth.ProfileCompletionRequest;

public interface AuthService {
    AuthResponse adminLogin(AuthRequest request);
    AuthResponse googleLogin(GoogleAuthRequest request);
    PhoneOtpRequestResponse requestPhoneOtp(PhoneOtpRequest request);
    AuthResponse verifyPhoneOtp(PhoneOtpVerifyRequest request);
    GoogleClientIdResponse getGoogleClientId();
    AuthResponse completeProfile(ProfileCompletionRequest request);
    AuthResponse updateDeliveryPreference(DeliveryPreferenceRequest request);
}
