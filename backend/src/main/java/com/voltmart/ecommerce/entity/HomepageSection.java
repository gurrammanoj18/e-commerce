package com.voltmart.ecommerce.entity;

import com.voltmart.ecommerce.entity.enums.HomepageSectionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomepageSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sectionKey;

    @Column(nullable = false)
    private String eyebrow;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HomepageSectionType type;

    @Column(columnDefinition = "text")
    private String keywords;

    @Column(nullable = false)
    private Integer displayOrder;

    @Column(nullable = false)
    private Integer maxProducts;

    @Column(nullable = false)
    private Boolean active;
}
