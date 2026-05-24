package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.common.PagedResponse;
import com.voltmart.ecommerce.dto.product.ProductRequest;
import com.voltmart.ecommerce.dto.product.ProductResponse;

import java.util.List;

public interface ProductService {
    PagedResponse<ProductResponse> getProducts(String category, String search, String sort, int page, int size);
    List<ProductResponse> getAllProducts();
    ProductResponse getProductBySlug(String slug);
    List<ProductResponse> getFeaturedProducts();
    List<ProductResponse> getBestSellerProducts();
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
}
