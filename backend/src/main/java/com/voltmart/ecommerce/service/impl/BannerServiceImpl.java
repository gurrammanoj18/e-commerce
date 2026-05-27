package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.banner.BannerRequest;
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
    public BannerResponse createBanner(BannerRequest request) {
        return toResponse(bannerRepository.save(Banner.builder()
                .title(request.title().trim())
                .subtitle(trimOrNull(request.subtitle()))
                .imageUrl(request.imageUrl().trim())
                .ctaLabel(trimOrNull(request.ctaLabel()))
                .ctaHref(trimOrNull(request.ctaHref()))
                .displayOrder(request.displayOrder())
                .active(request.active())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build()));
    }

    @Override
    @Transactional
    public BannerResponse updateBanner(Long id, BannerRequest request) {
        var banner = bannerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Banner not found"));
        banner.setTitle(request.title().trim());
        banner.setSubtitle(trimOrNull(request.subtitle()));
        banner.setImageUrl(request.imageUrl().trim());
        banner.setCtaLabel(trimOrNull(request.ctaLabel()));
        banner.setCtaHref(trimOrNull(request.ctaHref()));
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
                banner.getDisplayOrder(),
                banner.isActive()
        );
    }

    private String trimOrNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
