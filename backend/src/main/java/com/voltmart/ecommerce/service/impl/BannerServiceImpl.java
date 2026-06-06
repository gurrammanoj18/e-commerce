package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.banner.AdminBannerRequest;
import com.voltmart.ecommerce.dto.banner.BannerResponse;
import com.voltmart.ecommerce.entity.Banner;
import com.voltmart.ecommerce.exception.BadRequestException;
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
        String imageUrl = trimOrNull(request.imageUrl());
        String heading = trimOrNull(request.heading());
        Banner.BannerBuilder builder = Banner.builder()
                .imageUrl(imageUrl)
                .placement(placement);

        if (HOMEPAGE_PLACEMENT.equals(placement)) {
            String requiredHeading = requireHeading(heading);
            builder.heading(requiredHeading);
            builder.slug(slugify(requiredHeading));
        } else if (heading != null) {
            builder.heading(heading);
            builder.slug(slugify(heading));
        }

        return toResponse(bannerRepository.save(builder.build()));
    }

    @Override
    @Transactional
    public BannerResponse updateBanner(Long id, AdminBannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found"));

        banner.setImageUrl(trimOrNull(request.imageUrl()));
        String heading = trimOrNull(request.heading());
        if (heading != null) {
            banner.setHeading(heading);
            if (banner.getSlug() == null || banner.getSlug().isBlank()) {
                banner.setSlug(slugify(heading));
            }
        } else if (HOMEPAGE_PLACEMENT.equals(banner.getPlacement())
                && (banner.getHeading() == null || banner.getHeading().isBlank())) {
            throw new BadRequestException("Banner heading is required for homepage banners");
        }

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
                banner.getHeading(),
                banner.getSlug(),
                banner.getPlacement()
        );
    }

    private String trimOrNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String requireHeading(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Banner heading is required for homepage banners");
        }

        return value.trim();
    }

    private String slugify(String value) {
        String slug = value.toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        return slug.isBlank() ? "banner" : slug;
    }
}
