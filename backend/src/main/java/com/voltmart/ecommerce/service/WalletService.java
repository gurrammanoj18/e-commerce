package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.wallet.WalletCouponRequest;
import com.voltmart.ecommerce.dto.wallet.WalletCouponGrantRequest;
import com.voltmart.ecommerce.dto.wallet.WalletCouponResponse;
import com.voltmart.ecommerce.dto.wallet.WalletCouponRedemptionResponse;
import com.voltmart.ecommerce.dto.wallet.WalletResponse;
import com.voltmart.ecommerce.entity.User;
import com.voltmart.ecommerce.entity.WalletCoupon;

import java.util.List;

public interface WalletService {
    WalletResponse getCurrentUserWallet();
    WalletResponse redeemWalletTopupCode(String code);
    List<WalletCouponResponse> getAllCoupons();
    List<WalletCouponResponse> getCustomerCheckoutCoupons();
    WalletCouponResponse createCoupon(WalletCouponRequest request);
    WalletCouponResponse updateCoupon(Long id, WalletCouponRequest request);
    void deleteCoupon(Long id);
    List<WalletCouponRedemptionResponse> getCouponRedemptions(Long couponId);
    WalletCouponRedemptionResponse grantCouponRedemptions(Long couponId, WalletCouponGrantRequest request);
    void consumeCouponForUser(WalletCoupon coupon, User user);
    void applyDueWalletCredits();
}
