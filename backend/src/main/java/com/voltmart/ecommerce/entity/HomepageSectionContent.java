package com.voltmart.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "homepage_section_content")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomepageSectionContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sectionKey;

    @Column(nullable = false)
    private String tagline;

    @Column(nullable = false)
    private String heading;
}
