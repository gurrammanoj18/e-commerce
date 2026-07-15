package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.auth.AuthRequest;
import com.voltmart.ecommerce.dto.auth.AuthResponse;
import com.voltmart.ecommerce.config.AppProperties;
import com.voltmart.ecommerce.dto.auth.GoogleClientIdResponse;
import com.voltmart.ecommerce.dto.auth.GoogleAuthRequest;
import com.voltmart.ecommerce.dto.auth.PhoneOtpRequest;
import com.voltmart.ecommerce.dto.auth.PhoneOtpRequestResponse;
import com.voltmart.ecommerce.dto.auth.PhoneOtpVerifyRequest;
import com.voltmart.ecommerce.entity.Cart;
import com.voltmart.ecommerce.entity.LoginOtpChallenge;
import com.voltmart.ecommerce.entity.User;
import com.voltmart.ecommerce.entity.Wishlist;
import com.voltmart.ecommerce.dto.auth.DeliveryPreferenceRequest;
import com.voltmart.ecommerce.dto.auth.ProfileCompletionRequest;
import com.voltmart.ecommerce.entity.enums.Role;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.mapper.EntityMapper;
import com.voltmart.ecommerce.repository.CartRepository;
import com.voltmart.ecommerce.repository.LoginOtpChallengeRepository;
import com.voltmart.ecommerce.repository.UserRepository;
import com.voltmart.ecommerce.repository.WishlistRepository;
import com.voltmart.ecommerce.security.JwtService;
import com.voltmart.ecommerce.service.AuthService;
import com.voltmart.ecommerce.service.CurrentUserService;
import com.voltmart.ecommerce.service.SmsOtpGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private static final int OTP_EXPIRY_SECONDS = 300;
    private static final int OTP_MAX_FAILED_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final LoginOtpChallengeRepository loginOtpChallengeRepository;
    private final SmsOtpGateway smsOtpGateway;
    private final JwtService jwtService;
    private final EntityMapper entityMapper;
    private final AppProperties appProperties;
    private final AuthenticationManager authenticationManager;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

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
        if (!StringUtils.hasText(googleEmail)) {
            throw new BadRequestException("Google account did not provide an email address.");
        }

        String email = googleEmail.trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .map(existingUser -> {
                    if (existingUser.getRole() == Role.ROLE_ADMIN) {
                        throw new BadRequestException("Use admin login for administrator access.");
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

        String token = jwtService.generateToken(user, Map.of("role", user.getRole().name()));
        return buildAuthResponse(user, token, true);
    }

    @Override
    @Transactional
    public PhoneOtpRequestResponse requestPhoneOtp(PhoneOtpRequest request) {
        String phoneNumber = normalizePhoneNumber(request.phoneNumber());
        if (userRepository.findByPhoneNumber(phoneNumber).map(User::getRole).orElse(Role.ROLE_CUSTOMER) == Role.ROLE_ADMIN) {
            throw new BadRequestException("Use admin login for administrator access.");
        }

        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        String message = appProperties.getSmsOtp().getMessageTemplate()
                .replace("{otp}", otp)
                .replace("{minutes}", String.valueOf(Math.max(1, OTP_EXPIRY_SECONDS / 60)));

        LocalDateTime now = LocalDateTime.now();
        loginOtpChallengeRepository.deleteByPhoneNumberAndVerifiedAtIsNull(phoneNumber);
        loginOtpChallengeRepository.deleteByPhoneNumberAndVerifiedAtIsNullAndExpiresAtBefore(phoneNumber, now);

        loginOtpChallengeRepository.save(LoginOtpChallenge.builder()
                .phoneNumber(phoneNumber)
                .otpHash(passwordEncoder.encode(otp))
                .expiresAt(now.plusSeconds(OTP_EXPIRY_SECONDS))
                .failedAttempts(0)
                .createdAt(now)
                .updatedAt(now)
                .build());

        smsOtpGateway.sendOtp(phoneNumber, message);
        return new PhoneOtpRequestResponse(phoneNumber, OTP_EXPIRY_SECONDS, true);
    }

    @Override
    @Transactional
    public AuthResponse verifyPhoneOtp(PhoneOtpVerifyRequest request) {
        String phoneNumber = normalizePhoneNumber(request.phoneNumber());
        LoginOtpChallenge challenge = loginOtpChallengeRepository
                .findTopByPhoneNumberAndVerifiedAtIsNullOrderByCreatedAtDesc(phoneNumber)
                .orElseThrow(() -> new BadRequestException("OTP expired. Please request a new one."));

        LocalDateTime now = LocalDateTime.now();
        if (challenge.getExpiresAt().isBefore(now)) {
            throw new BadRequestException("OTP expired. Please request a new one.");
        }
        if (challenge.getFailedAttempts() != null && challenge.getFailedAttempts() >= OTP_MAX_FAILED_ATTEMPTS) {
            throw new BadRequestException("Too many invalid attempts. Please request a new OTP.");
        }
        if (!passwordEncoder.matches(request.otp(), challenge.getOtpHash())) {
            challenge.setFailedAttempts((challenge.getFailedAttempts() == null ? 0 : challenge.getFailedAttempts()) + 1);
            challenge.setUpdatedAt(now);
            loginOtpChallengeRepository.save(challenge);
            throw new BadRequestException("Invalid OTP.");
        }

        challenge.setVerifiedAt(now);
        challenge.setUpdatedAt(now);
        loginOtpChallengeRepository.save(challenge);
        return issueLoginForPhoneNumber(phoneNumber);
    }

    @Override
    public GoogleClientIdResponse getGoogleClientId() {
        return new GoogleClientIdResponse(appProperties.getGoogle().getClientId());
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
        String phoneNumber = normalizePhoneNumber(request.phoneNumber());
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
        user.setMobileVerified(true);
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

    private String normalizePhoneNumber(String value) {
        String digitsOnly = value == null ? "" : value.replaceAll("\\D", "");
        if (digitsOnly.startsWith("91") && digitsOnly.length() > 10) {
            digitsOnly = digitsOnly.substring(2);
        }

        if (!digitsOnly.matches("^[6-9][0-9]{9}$")) {
            throw new BadRequestException("Enter a valid 10 digit Indian mobile number.");
        }

        return digitsOnly;
    }

    private AuthResponse issueLoginForPhoneNumber(String phoneNumber) {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .map(existingUser -> {
                    if (existingUser.getRole() == Role.ROLE_ADMIN) {
                        throw new BadRequestException("Use admin login for administrator access.");
                    }
                    return existingUser;
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName("")
                        .phoneNumber(phoneNumber)
                        .mobileVerified(true)
                        .role(Role.ROLE_CUSTOMER)
                        .walletBalance(BigDecimal.ZERO)
                        .createdAt(LocalDateTime.now())
                        .build()));

        if (!Boolean.TRUE.equals(user.getMobileVerified())) {
            user.setMobileVerified(true);
            user = userRepository.save(user);
        }

        User savedUser = user;
        cartRepository.findByUserId(savedUser.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(savedUser).build()));
        wishlistRepository.findByUserId(savedUser.getId())
                .orElseGet(() -> wishlistRepository.save(Wishlist.builder().user(savedUser).build()));

        String token = jwtService.generateToken(savedUser, Map.of("role", savedUser.getRole().name()));
        return buildAuthResponse(savedUser, token, true);
    }
}
