package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.common.PagedResponse;
import com.voltmart.ecommerce.dto.product.ProductRequest;
import com.voltmart.ecommerce.dto.product.ProductResponse;
import com.voltmart.ecommerce.entity.Inventory;
import com.voltmart.ecommerce.entity.Product;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.mapper.EntityMapper;
import com.voltmart.ecommerce.repository.CategoryRepository;
import com.voltmart.ecommerce.repository.InventoryRepository;
import com.voltmart.ecommerce.repository.ProductRepository;
import com.voltmart.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CategoryRepository categoryRepository;
    private final EntityMapper entityMapper;

    @Override
    public PagedResponse<ProductResponse> getProducts(String category, String search, String sort, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        var productPage = productRepository.search(emptyToNull(category), emptyToNull(search), pageable);
        var content = productPage.getContent().stream()
                .map(product -> entityMapper.toProductResponse(product, inventoryFor(product.getId())))
                .toList();
        return new PagedResponse<>(content, page, size, productPage.getTotalElements(), productPage.getTotalPages());
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll(resolveSort("newest")).stream()
                .map(product -> entityMapper.toProductResponse(product, inventoryFor(product.getId())))
                .toList();
    }

    @Override
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return entityMapper.toProductResponse(product, inventoryFor(product.getId()));
    }

    @Override
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findAll().stream()
                .filter(Product::getFeatured)
                .map(product -> entityMapper.toProductResponse(product, inventoryFor(product.getId())))
                .toList();
    }

    @Override
    public List<ProductResponse> getBestSellerProducts() {
        return productRepository.findAll().stream()
                .filter(Product::getBestSeller)
                .map(product -> entityMapper.toProductResponse(product, inventoryFor(product.getId())))
                .toList();
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = buildProduct(new Product(), request);
        product.setCreatedAt(LocalDateTime.now());
        Product savedProduct = productRepository.save(product);

        Inventory inventory = inventoryRepository.save(Inventory.builder()
                .product(savedProduct)
                .stockQuantity(request.stockQuantity())
                .lowStockThreshold(request.lowStockThreshold())
                .updatedAt(LocalDateTime.now())
                .build());

        return entityMapper.toProductResponse(savedProduct, inventory);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        Product savedProduct = productRepository.save(buildProduct(product, request));

        Inventory inventory = inventoryFor(savedProduct.getId());
        inventory.setStockQuantity(request.stockQuantity());
        inventory.setLowStockThreshold(request.lowStockThreshold());
        inventory.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inventory);

        return entityMapper.toProductResponse(savedProduct, inventory);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        productRepository.delete(productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found")));
    }

    private Product buildProduct(Product product, ProductRequest request) {
        product.setSlug(request.slug());
        product.setName(request.name());
        product.setBrand(request.brand());
        product.setCategory(categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found")));
        product.setPrice(request.price());
        product.setOriginalPrice(request.originalPrice());
        product.setShortDescription(request.shortDescription());
        product.setDescription(request.description());
        product.setSpecifications(entityMapper.writeSpecifications(request.specifications()));
        product.setRating(request.rating());
        product.setReviewCount(request.reviewCount());
        product.setFeatured(request.featured());
        product.setBestSeller(request.bestSeller());
        product.setNewArrival(request.newArrival());
        product.setBulkEligible(request.bulkEligible());
        product.setBadge(request.badge());
        product.setHeroTag(request.heroTag());
        product.setImageUrls(request.images() == null ? List.of() : request.images());
        product.setTags(request.tags() == null ? List.of() : request.tags());
        return product;
    }

    private Inventory inventoryFor(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory missing for product " + productId));
    }

    private Sort resolveSort(String sort) {
        if ("price-low".equalsIgnoreCase(sort)) {
            return Sort.by("price").ascending();
        }
        if ("price-high".equalsIgnoreCase(sort)) {
            return Sort.by("price").descending();
        }
        if ("rating".equalsIgnoreCase(sort)) {
            return Sort.by("rating").descending();
        }
        if ("newest".equalsIgnoreCase(sort)) {
            return Sort.by("createdAt").descending();
        }
        return Sort.by(Sort.Order.desc("featured"), Sort.Order.desc("createdAt"));
    }

    private String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
