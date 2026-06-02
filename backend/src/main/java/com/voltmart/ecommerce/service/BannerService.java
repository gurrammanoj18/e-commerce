package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.banner.AdminBannerRequest;
import com.voltmart.ecommerce.dto.banner.BannerResponse;

import java.util.List;

public interface BannerService {

    List<BannerResponse> getAllBanners();

    BannerResponse createBanner(AdminBannerRequest request);

    BannerResponse updateBanner(Long id, AdminBannerRequest request);

    void deleteBanner(Long id);
}
