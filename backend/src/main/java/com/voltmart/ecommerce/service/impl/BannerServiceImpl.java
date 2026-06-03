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

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private static final String HOMEPAGE_PLACEMENT = "HOMEPAGE";
    private static final String SEASONAL_PICK_PLACEMENT = "SEASONAL_PICK";

    private final BannerRepository bannerRepository;

    @Override
    public List<BannerResponse> getAllBanners() {
        return bannerRepository
                .findByPlacementOrderByIdDesc(HOMEPAGE_PLACEMENT)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<BannerResponse> getHomepageBanners() {
        return getAllBanners();
    }

    @Override
    public List<BannerResponse> getSeasonalPicks() {
        return bannerRepository
                .findByPlacementOrderByIdDesc(SEASONAL_PICK_PLACEMENT)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BannerResponse createBanner(AdminBannerRequest request) {
        return createBanner(request, HOMEPAGE_PLACEMENT);
    }

    @Override
    @Transactional
    public BannerResponse createSeasonalPick(AdminBannerRequest request) {
        return createBanner(request, SEASONAL_PICK_PLACEMENT);
    }

    private BannerResponse createBanner(AdminBannerRequest request, String placement) {
        Banner banner = Banner.builder()
                .imageUrl(trimOrNull(request.imageUrl()))
                .placement(placement)
                .build();

        return toResponse(bannerRepository.save(banner));
    }

    @Override
    @Transactional
    public BannerResponse updateBanner(Long id, AdminBannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found"));

        banner.setImageUrl(trimOrNull(request.imageUrl()));

        return toResponse(bannerRepository.save(banner));
    }

    @Override
    @Transactional
    public void deleteBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found"));

        bannerRepository.delete(banner);
    }

    private BannerResponse toResponse(Banner banner) {
        return new BannerResponse(
                banner.getId(),
                banner.getImageUrl(),
                banner.getPlacement()
        );
    }

    private String trimOrNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
