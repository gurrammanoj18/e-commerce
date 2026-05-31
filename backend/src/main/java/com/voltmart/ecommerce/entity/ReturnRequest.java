package com.voltmart.ecommerce.entity;

import com.voltmart.ecommerce.entity.enums.ReturnResolution;
import com.voltmart.ecommerce.entity.enums.ReturnRequestStatus;
import com.voltmart.ecommerce.entity.enums.ReturnRequestType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "return_requests")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReturnRequestStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false)
    private ReturnRequestType requestType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReturnResolution preferredResolution;

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(length = 2000)
    private String adminNote;

    @Column(nullable = false)
    private boolean initiatedByAdmin;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;

    private LocalDateTime refundedAt;

    @Column(nullable = false)
    private boolean refundProcessed;
}
