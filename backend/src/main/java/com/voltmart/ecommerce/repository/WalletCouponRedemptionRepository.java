package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.WalletCouponRedemption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WalletCouponRedemptionRepository extends JpaRepository<WalletCouponRedemption, Long> {
    Optional<WalletCouponRedemption> findByCouponIdAndUserId(Long couponId, Long userId);
    List<WalletCouponRedemption> findByCouponIdOrderByUpdatedAtDesc(Long couponId);
}
