package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.WalletCoupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletCouponRepository extends JpaRepository<WalletCoupon, Long> {
    Optional<WalletCoupon> findByCodeIgnoreCase(String code);
}
