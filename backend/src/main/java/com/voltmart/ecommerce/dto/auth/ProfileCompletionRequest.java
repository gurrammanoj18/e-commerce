package com.voltmart.ecommerce.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ProfileCompletionRequest(
        @NotBlank @Pattern(regexp = "^[A-Za-z][A-Za-z\\s.'-]*$", message = "Full name can only contain letters") String fullName,
        @NotBlank @Pattern(regexp = "^\\d{10}$", message = "Mobile number must be exactly 10 digits") String phoneNumber,
        @Email String email,
        String profileImageUrl
) {
}
