package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.homepage.HomepageSectionContentRequest;
import com.voltmart.ecommerce.dto.homepage.HomepageSectionContentResponse;
import com.voltmart.ecommerce.entity.HomepageSectionContent;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.repository.HomepageSectionContentRepository;
import com.voltmart.ecommerce.service.HomepageSectionContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HomepageSectionContentServiceImpl implements HomepageSectionContentService {

    private final HomepageSectionContentRepository repository;

    private static final List<DefaultSection> DEFAULT_SECTIONS = List.of(
            new DefaultSection("categories", "Categories", "Shop by Category", 10),
            new DefaultSection("hard-to-find", "Hard-to-Find Products", "Hard-to-Find Products", 20),
            new DefaultSection("everyday-essentials", "Everyday Essentials", "Everyday Essentials", 30),
            new DefaultSection("shop-by-brand", "Shop by Brand", "Shop by Brand", 40),
            new DefaultSection("electrical-essentials", "Electrical Essentials", "Electrical Essentials", 50),
            new DefaultSection("hardware-tools", "Hardware & Tools", "Hardware & Tools", 60),
            new DefaultSection("plumbing-bathroom", "Plumbing & Bathroom", "Plumbing & Bathroom", 70),
            new DefaultSection("seasonal-picks", "Seasonal picks", "Seasonal Picks", 80),
            new DefaultSection("recently-added", "Recently added products", "Recently Added", 90),
            new DefaultSection("best-selling", "Best-selling products", "Best-Selling Products", 100)
    );

    @Override
    @Transactional
    @Cacheable(cacheNames = "homepageSections")
    public List<HomepageSectionContentResponse> getSections() {
        return DEFAULT_SECTIONS.stream()
                .sorted(Comparator.comparingInt(DefaultSection::displayOrder))
                .map((section) -> repository.findBySectionKey(section.sectionKey())
                        .map(this::toResponse)
                        .orElseGet(() -> new HomepageSectionContentResponse(
                                section.sectionKey(),
                                section.tagline(),
                                section.heading()
                        )))
                .toList();
    }

    @Override
    @Transactional
    public HomepageSectionContentResponse updateSection(String sectionKey, HomepageSectionContentRequest request) {
        DefaultSection defaultSection = DEFAULT_SECTIONS.stream()
                .filter((section) -> section.sectionKey().equals(sectionKey))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Homepage section not found"));

        HomepageSectionContent content = repository.findBySectionKey(sectionKey)
                .orElseGet(() -> HomepageSectionContent.builder()
                        .sectionKey(defaultSection.sectionKey())
                        .build());

        content.setTagline(trim(request.tagline()));
        content.setHeading(trim(request.heading()));

        return toResponse(repository.save(content));
    }

    private HomepageSectionContentResponse toResponse(HomepageSectionContent content) {
        return new HomepageSectionContentResponse(
                content.getSectionKey(),
                content.getTagline(),
                content.getHeading()
        );
    }

    private String trim(String value) {
        return value == null ? "" : value.trim();
    }

    private record DefaultSection(String sectionKey, String tagline, String heading, int displayOrder) {
    }
}
