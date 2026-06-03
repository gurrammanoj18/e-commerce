package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.auth.AuthRequest;
import com.voltmart.ecommerce.dto.auth.AuthResponse;
import com.voltmart.ecommerce.dto.auth.DeliveryPreferenceRequest;
import com.voltmart.ecommerce.dto.auth.GoogleAuthRequest;
import com.voltmart.ecommerce.dto.auth.ProfileCompletionRequest;

public interface AuthService {
    AuthResponse adminLogin(AuthRequest request);
    AuthResponse googleLogin(GoogleAuthRequest request);
    AuthResponse completeProfile(ProfileCompletionRequest request);
    AuthResponse updateDeliveryPreference(DeliveryPreferenceRequest request);
}
