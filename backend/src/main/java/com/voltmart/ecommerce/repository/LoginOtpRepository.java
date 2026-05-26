package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.LoginOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoginOtpRepository extends JpaRepository<LoginOtp, Long> {
    Optional<LoginOtp> findTopByEmailOrderByCreatedAtDesc(String email);
}
