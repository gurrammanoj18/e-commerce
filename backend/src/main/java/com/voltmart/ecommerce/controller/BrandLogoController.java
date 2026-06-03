package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.brandlogo.BrandLogoResponse;
import com.voltmart.ecommerce.service.BrandLogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/brand-logos")
@RequiredArgsConstructor
public class BrandLogoController {

    private final BrandLogoService brandLogoService;

    @GetMapping
    public List<BrandLogoResponse> getLogos() {
        return brandLogoService.getPublicLogos();
    }
}
