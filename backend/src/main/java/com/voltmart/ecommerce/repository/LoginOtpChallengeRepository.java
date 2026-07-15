package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.LoginOtpChallenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface LoginOtpChallengeRepository extends JpaRepository<LoginOtpChallenge, Long> {
    Optional<LoginOtpChallenge> findTopByPhoneNumberAndVerifiedAtIsNullOrderByCreatedAtDesc(String phoneNumber);
    void deleteByPhoneNumberAndVerifiedAtIsNull(String phoneNumber);
    void deleteByPhoneNumberAndVerifiedAtIsNullAndExpiresAtBefore(String phoneNumber, LocalDateTime expiry);
}
