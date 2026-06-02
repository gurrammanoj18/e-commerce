package com.voltmart.ecommerce.entity;

import com.voltmart.ecommerce.entity.enums.WalletCouponType;
import com.voltmart.ecommerce.entity.enums.WalletCouponRedemptionFrequency;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_coupon")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletCoupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WalletCouponType type;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(length = 500)
    private String description;

    @Column(length = 2000)
    private String assignedCustomerEmails;

    @Column(nullable = false)
    @Builder.Default
    private Integer discountPercentage = 0;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @Column(nullable = false)
    private Integer rewardDelayMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private WalletCouponRedemptionFrequency redemptionFrequency = WalletCouponRedemptionFrequency.ONCE;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
