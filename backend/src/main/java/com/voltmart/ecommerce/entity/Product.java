package com.voltmart.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String brand;

    @ManyToOne(optional = false)
    private Category category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal originalPrice;

    @Column(nullable = false, length = 500)
    private String shortDescription;

    @Column(nullable = false, length = 4000)
    private String description;

    @Column(length = 1000)
    private String specifications;

    @Column(nullable = false)
    private Double rating;

    @Column(nullable = false)
    private Integer reviewCount;

    @Column(nullable = false)
    private Boolean featured;

    @Column(nullable = false)
    private Boolean bestSeller;

    @Column(nullable = false)
    private Boolean newArrival;

    @Column(nullable = false)
    private Boolean bulkEligible;

    @Column(nullable = false)
    private Boolean warrantyAvailable;

    @Column(nullable = false)
    private Boolean replacementAvailable;

    @Column(nullable = false)
    private String badge;

    @Column(nullable = false)
    private String heroTag;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "product_tags", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
