package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.brandlogo.BrandLogoRequest;
import com.voltmart.ecommerce.dto.brandlogo.BrandLogoResponse;
import com.voltmart.ecommerce.entity.BrandLogo;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.repository.BrandLogoRepository;
import com.voltmart.ecommerce.service.BrandLogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandLogoServiceImpl implements BrandLogoService {

    private final BrandLogoRepository brandLogoRepository;

    @Override
    public List<BrandLogoResponse> getPublicLogos() {
        return brandLogoRepository.findByActiveTrueOrderByDisplayOrderAscIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<BrandLogoResponse> getAdminLogos() {
        return brandLogoRepository.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BrandLogoResponse createLogo(BrandLogoRequest request) {
        BrandLogo logo = new BrandLogo();
        applyRequest(logo, request);
        return toResponse(brandLogoRepository.save(logo));
    }

    @Override
    @Transactional
    public BrandLogoResponse updateLogo(Long id, BrandLogoRequest request) {
        BrandLogo logo = brandLogoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand logo not found"));
        applyRequest(logo, request);
        return toResponse(brandLogoRepository.save(logo));
    }

    @Override
    @Transactional
    public void deleteLogo(Long id) {
        BrandLogo logo = brandLogoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand logo not found"));
        brandLogoRepository.delete(logo);
    }

    private void applyRequest(BrandLogo logo, BrandLogoRequest request) {
        logo.setBrandName(trim(request.brandName()));
        logo.setLogoUrl(trim(request.logoUrl()));
        logo.setDisplayOrder(request.displayOrder());
        logo.setActive(request.active());
    }

    private BrandLogoResponse toResponse(BrandLogo logo) {
        return new BrandLogoResponse(
                logo.getId(),
                logo.getBrandName(),
                logo.getLogoUrl(),
                logo.getDisplayOrder(),
                logo.getActive()
        );
    }

    private String trim(String value) {
        return value == null ? "" : value.trim();
    }
}
