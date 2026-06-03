package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.auth.AuthRequest;
import com.voltmart.ecommerce.dto.auth.AuthResponse;
import com.voltmart.ecommerce.entity.Cart;
import com.voltmart.ecommerce.entity.LoginOtp;
import com.voltmart.ecommerce.entity.User;
import com.voltmart.ecommerce.entity.Wishlist;
import com.voltmart.ecommerce.config.AppProperties;
import com.voltmart.ecommerce.dto.auth.DeliveryPreferenceRequest;
import com.voltmart.ecommerce.dto.auth.GoogleAuthRequest;
import com.voltmart.ecommerce.dto.auth.OtpChallengeResponse;
import com.voltmart.ecommerce.dto.auth.OtpRequest;
import com.voltmart.ecommerce.dto.auth.OtpVerifyRequest;
import com.voltmart.ecommerce.dto.auth.ProfileCompletionRequest;
import com.voltmart.ecommerce.entity.enums.Role;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.mapper.EntityMapper;
import com.voltmart.ecommerce.repository.CartRepository;
import com.voltmart.ecommerce.repository.LoginOtpRepository;
import com.voltmart.ecommerce.repository.UserRepository;
import com.voltmart.ecommerce.repository.WishlistRepository;
import com.voltmart.ecommerce.security.JwtService;
import com.voltmart.ecommerce.service.AuthService;
import com.voltmart.ecommerce.service.CurrentUserService;
import com.voltmart.ecommerce.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final LoginOtpRepository loginOtpRepository;
    private final JwtService jwtService;
    private final EntityMapper entityMapper;
    private final AppProperties appProperties;
    private final AuthenticationManager authenticationManager;
    private final EmailNotificationService emailNotificationService;
    private final CurrentUserService currentUserService;

    @Override
    public AuthResponse adminLogin(AuthRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
        );
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid login credentials"));
        if (user.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("Admin access is required");
        }

        String token = jwtService.generateToken(user, Map.of("role", user.getRole().name()));
        return buildAuthResponse(user, token, false);
    }

    @Override
    @Transactional
    public AuthResponse googleLogin(GoogleAuthRequest request) {
        String configuredClientId = appProperties.getGoogle().getClientId();
        if (!StringUtils.hasText(configuredClientId)) {
            throw new BadRequestException("Google login is not configured. Add the Google client ID in backend settings.");
        }

        Map<?, ?> tokenInfo;
        try {
            tokenInfo = RestClient.builder()
                    .baseUrl("https://oauth2.googleapis.com")
                    .build()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/tokeninfo")
                            .queryParam("id_token", request.credential())
                            .build())
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientResponseException exception) {
            throw new BadRequestException("Google token verification failed.");
        }

        if (tokenInfo == null || !configuredClientId.equals(String.valueOf(tokenInfo.get("aud")))) {
            throw new BadRequestException("Google token audience is invalid.");
        }
        if (!"true".equalsIgnoreCase(String.valueOf(tokenInfo.get("email_verified")))) {
            throw new BadRequestException("Google account email is not verified.");
        }
        String googleEmail = tokenInfo.get("email") == null ? null : String.valueOf(tokenInfo.get("email"));
        String googleName = tokenInfo.get("name") == null ? null : String.valueOf(tokenInfo.get("name"));
        if (!StringUtils.hasText(googleEmail)) {
            throw new BadRequestException("Google account did not provide an email address.");
        }

        String email = googleEmail.trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .map(existingUser -> {
                    if (existingUser.getRole() == Role.ROLE_ADMIN) {
                        throw new BadRequestException("Use admin login for administrator access.");
                    }
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName("")
                        .email(email)
                        .role(Role.ROLE_CUSTOMER)
                        .walletBalance(BigDecimal.ZERO)
                        .createdAt(LocalDateTime.now())
                        .build()));

        cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
        wishlistRepository.findByUserId(user.getId())
                .orElseGet(() -> wishlistRepository.save(Wishlist.builder().user(user).build()));

        String token = jwtService.generateToken(user, Map.of("role", user.getRole().name()));
        return buildAuthResponse(user, token, true);
    }

    @Override
    @Transactional
    public OtpChallengeResponse requestOtp(OtpRequest request) {
        String email = request.email().trim().toLowerCase();
        userRepository.findByEmail(email).ifPresent(user -> {
            if (user.getRole() == Role.ROLE_ADMIN) {
                throw new BadRequestException("Use admin login for administrator access");
            }
        });

        loginOtpRepository.findTopByEmailOrderByCreatedAtDesc(email).ifPresent(existingOtp -> {
            if (existingOtp.getConsumedAt() == null
                    && existingOtp.getExpiresAt().isAfter(LocalDateTime.now())
                    && existingOtp.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(60))) {
                throw new BadRequestException("An OTP was just sent. Please wait before requesting another code.");
            }
        });

        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);
        String otpCode = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1_000_000));
        try {
            emailNotificationService.sendLoginOtp(email, otpCode);
        } catch (IllegalStateException exception) {
            if (exception.getCause() == null) {
                throw new BadRequestException("Email OTP delivery is not configured. Check backend email settings.");
            }
            log.error("Email OTP send failed for {}: {}", email, exception.getCause().getMessage(), exception.getCause());
            throw new BadRequestException("Unable to send email OTP. Check SMTP credentials and email provider settings.");
        }
        loginOtpRepository.save(LoginOtp.builder()
                .email(email)
                .otpCode(otpCode)
                .expiresAt(expiresAt)
                .createdAt(LocalDateTime.now())
                .build());

        return new OtpChallengeResponse(
                "OTP sent successfully to your email address.",
                email,
                expiresAt
        );
    }

    @Override
    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        String email = request.email().trim().toLowerCase();
        LoginOtp loginOtp = loginOtpRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new BadRequestException("Request an OTP before verifying"));

        if (loginOtp.getConsumedAt() != null) {
            throw new BadRequestException("This OTP has already been used");
        }
        if (loginOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP expired. Please request a new code");
        }
        if (!loginOtp.getOtpCode().equals(request.otpCode())) {
            throw new BadRequestException("Invalid OTP code");
        }

        User user = userRepository.findByEmail(email)
                .map(existingUser -> {
                    if (existingUser.getRole() == Role.ROLE_ADMIN) {
                        throw new BadRequestException("Use admin login for administrator access");
                    }
                    return existingUser;
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName("")
                        .email(email)
                        .role(Role.ROLE_CUSTOMER)
                        .walletBalance(BigDecimal.ZERO)
                        .createdAt(LocalDateTime.now())
                        .build()));

        cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
        wishlistRepository.findByUserId(user.getId())
                .orElseGet(() -> wishlistRepository.save(Wishlist.builder().user(user).build()));

        loginOtp.setConsumedAt(LocalDateTime.now());
        loginOtpRepository.save(loginOtp);

        String token = jwtService.generateToken(user, Map.of("role", user.getRole().name()));
        return buildAuthResponse(user, token, true);
    }

    @Override
    @Transactional
    public AuthResponse completeProfile(ProfileCompletionRequest request) {
        User user = userRepository.findById(currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String email = trimToNull(request.email());
        if (!StringUtils.hasText(email)) {
            email = user.getEmail();
        }
        String phoneNumber = request.phoneNumber().trim();
        userRepository.findByPhoneNumber(phoneNumber)
                .filter(existingUser -> !existingUser.getId().equals(user.getId()))
                .ifPresent(existingUser -> {
                    throw new BadRequestException("This mobile number is already linked to another account");
                });
        if (StringUtils.hasText(email)) {
            userRepository.findByEmail(email)
                    .filter(existingUser -> !existingUser.getId().equals(user.getId()))
                    .ifPresent(existingUser -> {
                        throw new BadRequestException("This email is already linked to another account");
                    });
        }

        user.setFullName(request.fullName().trim());
        user.setPhoneNumber(phoneNumber);
        user.setEmail(email);
        user.setProfileImageUrl(trimToNull(request.profileImageUrl()));
        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser, Map.of("role", savedUser.getRole().name()));
        return buildAuthResponse(savedUser, token, false);
    }

    @Override
    @Transactional
    public AuthResponse updateDeliveryPreference(DeliveryPreferenceRequest request) {
        User user = userRepository.findById(currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (user.getRole() != Role.ROLE_CUSTOMER) {
            throw new BadRequestException("Delivery preference can only be set for customer accounts");
        }
        user.setPreferredDeliveryMode(request.preferredDeliveryMode());
        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser, Map.of("role", savedUser.getRole().name()));
        return buildAuthResponse(savedUser, token, false);
    }

    private AuthResponse buildAuthResponse(User user, String token, boolean allowGreeting) {
        boolean requiresProfileCompletion = requiresProfileCompletion(user);
        return new AuthResponse(
                token,
                entityMapper.toUserResponse(user),
                requiresProfileCompletion,
                allowGreeting && !requiresProfileCompletion && user.getRole() == Role.ROLE_CUSTOMER
        );
    }

    private boolean requiresProfileCompletion(User user) {
        return user.getRole() == Role.ROLE_CUSTOMER
                && (!StringUtils.hasText(user.getFullName())
                || "customer".equalsIgnoreCase(user.getFullName().trim())
                || !StringUtils.hasText(user.getPhoneNumber()));
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
