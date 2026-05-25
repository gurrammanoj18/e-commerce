package com.voltmart.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Wishlist wishlist;

    @ManyToOne(optional = false)
    private Product product;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
