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

    private final BannerRepository bannerRepository;

    @Override
    public List<BannerResponse> getAllBanners() {
        return bannerRepository
                .findAllByOrderByIdDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BannerResponse createBanner(AdminBannerRequest request) {
        Banner banner = Banner.builder()
                .imageUrl(trimOrNull(request.imageUrl()))
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
                banner.getImageUrl()
        );
    }

    private String trimOrNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
