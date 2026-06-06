package com.voltmart.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

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

    @Column(columnDefinition = "text", nullable = false)
    private String imageUrl;

    @Column(length = 255)
    private String heading;

    @Column(length = 255)
    private String slug;

    @Column(nullable = false)
    @Builder.Default
    private String placement = "HOMEPAGE";
}
