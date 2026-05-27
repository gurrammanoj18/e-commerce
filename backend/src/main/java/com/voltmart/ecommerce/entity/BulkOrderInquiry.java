package com.voltmart.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.voltmart.ecommerce.entity.enums.BulkQuoteStatus;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkOrderInquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;
    private String contactPerson;
    private String email;
    private String phone;
    private String productCategory;
    private Integer estimatedQuantity;

    private String deliveryCity;

    @Column(precision = 12, scale = 2)
    private BigDecimal budgetAmount;

    @Column(nullable = false)
    private boolean rfqRequired;

    @Column(nullable = false)
    private boolean priorityRequest;

    @Column(precision = 12, scale = 2)
    private BigDecimal estimatedTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BulkQuoteStatus quoteStatus;

    @Column(length = 2000)
    private String adminNotes;

    @Column(length = 2000)
    private String requirements;

    @OneToMany(mappedBy = "inquiry", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BulkOrderInquiryLineItem> lineItems = new ArrayList<>();

    private LocalDateTime createdAt;
}
