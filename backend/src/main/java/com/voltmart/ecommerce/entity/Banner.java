package com.voltmart.ecommerce.entity;

import com.voltmart.ecommerce.entity.enums.BannerType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "banner")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String subtitle;

    @Column(length = 2000)
    private String imageUrl;

    private String ctaLabel;

    private String ctaHref;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BannerType type;

    @Column(nullable = false)
    private Integer displayOrder;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
