package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.banner.BannerRequest;
import com.voltmart.ecommerce.dto.banner.BannerResponse;

import java.util.List;

public interface BannerService {
    List<BannerResponse> getActiveBanners();
    List<BannerResponse> getAllBanners();
    BannerResponse createBanner(BannerRequest request);
    BannerResponse updateBanner(Long id, BannerRequest request);
    void deleteBanner(Long id);
}
