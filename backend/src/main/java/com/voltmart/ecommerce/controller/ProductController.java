package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.common.PagedResponse;
import com.voltmart.ecommerce.dto.product.ProductResponse;
import com.voltmart.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public PagedResponse<ProductResponse> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minDiscount,
            @RequestParam(required = false) String availability,
            @RequestParam(defaultValue = "featured") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return productService.getProducts(
                category,
                search,
                brand,
                minPrice,
                maxPrice,
                minDiscount,
                availability,
                sort,
                page,
                size
        );
    }

    @GetMapping("/catalog")
    public List<ProductResponse> getCatalogProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/featured")
    public List<ProductResponse> getFeaturedProducts() {
        return productService.getFeaturedProducts();
    }

    @GetMapping("/best-sellers")
    public List<ProductResponse> getBestSellerProducts() {
        return productService.getBestSellerProducts();
    }

    @GetMapping("/{slug}")
    public ProductResponse getProduct(@PathVariable String slug) {
        return productService.getProductBySlug(slug);
    }
}
