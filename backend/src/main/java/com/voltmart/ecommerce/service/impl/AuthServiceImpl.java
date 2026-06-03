package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.auth.AuthRequest;
import com.voltmart.ecommerce.dto.auth.AuthResponse;
import com.voltmart.ecommerce.entity.Cart;
import com.voltmart.ecommerce.entity.User;
import com.voltmart.ecommerce.entity.Wishlist;
import com.voltmart.ecommerce.config.AppProperties;
import com.voltmart.ecommerce.dto.auth.DeliveryPreferenceRequest;
import com.voltmart.ecommerce.dto.auth.GoogleAuthRequest;
import com.voltmart.ecommerce.dto.auth.ProfileCompletionRequest;
import com.voltmart.ecommerce.entity.enums.Role;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.mapper.EntityMapper;
import com.voltmart.ecommerce.repository.CartRepository;
import com.voltmart.ecommerce.repository.UserRepository;
import com.voltmart.ecommerce.repository.WishlistRepository;
import com.voltmart.ecommerce.security.JwtService;
import com.voltmart.ecommerce.service.AuthService;
import com.voltmart.ecommerce.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final JwtService jwtService;
    private final EntityMapper entityMapper;
    private final AppProperties appProperties;
    private final AuthenticationManager authenticationManager;
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
