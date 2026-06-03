package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.brandlogo.BrandLogoRequest;
import com.voltmart.ecommerce.dto.brandlogo.BrandLogoResponse;

import java.util.List;

public interface BrandLogoService {

    List<BrandLogoResponse> getPublicLogos();

    List<BrandLogoResponse> getAdminLogos();

    BrandLogoResponse createLogo(BrandLogoRequest request);

    BrandLogoResponse updateLogo(Long id, BrandLogoRequest request);

    void deleteLogo(Long id);
}
