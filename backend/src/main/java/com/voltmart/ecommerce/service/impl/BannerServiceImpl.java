package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.banner.AdminBannerRequest;
import com.voltmart.ecommerce.dto.banner.BannerResponse;
import com.voltmart.ecommerce.entity.Banner;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.repository.BannerRepository;
import com.voltmart.ecommerce.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;

    @Override
    public List<BannerResponse> getActiveBanners() {
        return bannerRepository.findByActiveTrueOrderByDisplayOrderAscCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Override
    public List<BannerResponse> getAllBanners() {
        return bannerRepository.findAllByOrderByDisplayOrderAscCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public BannerResponse createBanner(AdminBannerRequest request) {
        return toResponse(bannerRepository.save(Banner.builder()
                .title(defaultTitle(request.title(), request.type()))
                .subtitle(trimOrNull(request.subtitle()))
                .imageUrl(trimOrNull(request.imageUrl()))
                .ctaLabel(trimOrNull(request.ctaLabel()))
                .ctaHref(trimOrNull(request.ctaHref()))
                .type(request.type())
                .displayOrder(request.displayOrder())
                .active(request.active())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build()));
    }

    @Override
    @Transactional
    public BannerResponse updateBanner(Long id, AdminBannerRequest request) {
        var banner = bannerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Banner not found"));
        banner.setTitle(defaultTitle(request.title(), request.type()));
        banner.setSubtitle(trimOrNull(request.subtitle()));
        banner.setImageUrl(trimOrNull(request.imageUrl()));
        banner.setCtaLabel(trimOrNull(request.ctaLabel()));
        banner.setCtaHref(trimOrNull(request.ctaHref()));
        banner.setType(request.type());
        banner.setDisplayOrder(request.displayOrder());
        banner.setActive(request.active());
        banner.setUpdatedAt(LocalDateTime.now());
        return toResponse(bannerRepository.save(banner));
    }

    @Override
    @Transactional
    public void deleteBanner(Long id) {
        var banner = bannerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Banner not found"));
        bannerRepository.delete(banner);
    }

    private BannerResponse toResponse(Banner banner) {
        return new BannerResponse(
                banner.getId(),
                banner.getTitle(),
                banner.getSubtitle(),
                banner.getImageUrl(),
                banner.getCtaLabel(),
                banner.getCtaHref(),
                banner.getType().name(),
                banner.getDisplayOrder(),
                banner.isActive()
        );
    }

    private String trimOrNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String defaultTitle(String title, com.voltmart.ecommerce.entity.enums.BannerType type) {
        String normalized = trimOrNull(title);
        if (normalized != null) {
            return normalized;
        }
        return type == com.voltmart.ecommerce.entity.enums.BannerType.INFO ? "Store update" : "Featured banner";
    }
}
