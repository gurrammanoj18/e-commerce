package com.voltmart.ecommerce.controller.admin;

import com.voltmart.ecommerce.dto.brandlogo.BrandLogoRequest;
import com.voltmart.ecommerce.dto.brandlogo.BrandLogoResponse;
import com.voltmart.ecommerce.service.BrandLogoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/brand-logos")
@RequiredArgsConstructor
public class AdminBrandLogoController {

    private final BrandLogoService brandLogoService;

    @GetMapping
    public List<BrandLogoResponse> getLogos() {
        return brandLogoService.getAdminLogos();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BrandLogoResponse createLogo(@Valid @RequestBody BrandLogoRequest request) {
        return brandLogoService.createLogo(request);
    }

    @PutMapping("/{id}")
    public BrandLogoResponse updateLogo(@PathVariable Long id, @Valid @RequestBody BrandLogoRequest request) {
        return brandLogoService.updateLogo(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLogo(@PathVariable Long id) {
        brandLogoService.deleteLogo(id);
    }
}
