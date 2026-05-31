package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.wallet.WalletRedeemRequest;
import com.voltmart.ecommerce.dto.wallet.WalletResponse;
import com.voltmart.ecommerce.dto.wallet.WalletCouponResponse;
import com.voltmart.ecommerce.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/account/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public WalletResponse getWallet() {
        return walletService.getCurrentUserWallet();
    }

    @GetMapping("/checkout-coupons")
    public List<WalletCouponResponse> getCheckoutCoupons() {
        return walletService.getCustomerCheckoutCoupons();
    }

    @PostMapping("/redeem")
    public WalletResponse redeemCode(@Valid @RequestBody WalletRedeemRequest request) {
        return walletService.redeemWalletTopupCode(request.code());
    }
}
