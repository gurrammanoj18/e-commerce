package com.voltmart.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_request")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String serviceKey;

    @Column(nullable = false)
    private String serviceName;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false, length = 1000)
    private String address;

    @Column(nullable = false)
    private String postalCode;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(columnDefinition = "text")
    private String problemImages;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
