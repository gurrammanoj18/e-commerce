package com.voltmart.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "brand_logo")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandLogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String brandName;

    @Column(columnDefinition = "text", nullable = false)
    private String logoUrl;

    @Column(nullable = false)
    private Integer displayOrder;

    @Column(nullable = false)
    private Boolean active;
}
