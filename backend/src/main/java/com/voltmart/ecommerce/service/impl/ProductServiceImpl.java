package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.common.PagedResponse;
import com.voltmart.ecommerce.dto.product.ProductRequest;
import com.voltmart.ecommerce.dto.product.ProductResponse;
import com.voltmart.ecommerce.entity.Inventory;
import com.voltmart.ecommerce.entity.Product;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.mapper.EntityMapper;
import com.voltmart.ecommerce.repository.CartItemRepository;
import com.voltmart.ecommerce.repository.CategoryRepository;
import com.voltmart.ecommerce.repository.InventoryRepository;
import com.voltmart.ecommerce.repository.OrderItemRepository;
import com.voltmart.ecommerce.repository.ProductRepository;
import com.voltmart.ecommerce.repository.WishlistItemRepository;
import com.voltmart.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CategoryRepository categoryRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final EntityMapper entityMapper;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "productsPage", key = "T(java.util.Objects).hash(#category, #search, #brand, #minPrice, #maxPrice, #minDiscount, #availability, #sort, #page, #size)")
    public PagedResponse<ProductResponse> getProducts(
            String category,
            String search,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minDiscount,
            String availability,
            String sort,
            int page,
            int size
    ) {
        var filteredProducts = productRepository.findAll().stream()
                .map(product -> entityMapper.toProductResponse(product, inventoryFor(product.getId())))
                .filter(product -> matchesCategory(product, category))
                .filter(product -> matchesSearch(product, search))
                .filter(product -> matchesBrand(product, brand))
                .filter(product -> matchesPrice(product, minPrice, maxPrice))
                .filter(product -> matchesDiscount(product, minDiscount))
                .filter(product -> matchesAvailability(product, availability))
                .sorted(resolveComparator(sort))
                .toList();

        int fromIndex = Math.min(page * size, filteredProducts.size());
        int toIndex = Math.min(fromIndex + size, filteredProducts.size());
        var content = filteredProducts.subList(fromIndex, toIndex);
        int totalPages = size <= 0 ? 1 : Math.max(1, (int) Math.ceil((double) filteredProducts.size() / size));
        return new PagedResponse<>(content, page, size, filteredProducts.size(), totalPages);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "productsAll")
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll(resolveSort("newest")).stream()
                .map(product -> entityMapper.toProductResponse(product, inventoryFor(product.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "productBySlug", key = "#slug")
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return entityMapper.toProductResponse(product, inventoryFor(product.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "featuredProducts")
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findAll().stream()
                .filter(Product::getFeatured)
                .map(product -> entityMapper.toProductResponse(product, inventoryFor(product.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "bestSellerProducts")
    public List<ProductResponse> getBestSellerProducts() {
        List<Long> topProductIds = orderItemRepository.findTopDeliveredProductIds();
        if (!topProductIds.isEmpty()) {
            return productRepository.findAllById(topProductIds).stream()
                    .sorted((left, right) -> Integer.compare(
                            topProductIds.indexOf(left.getId()),
                            topProductIds.indexOf(right.getId())
                    ))
                    .map(product -> entityMapper.toProductResponse(product, inventoryFor(product.getId())))
                    .toList();
        }

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
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        cartItemRepository.deleteByProductIdIn(List.of(id));
        orderItemRepository.deleteByProductIdIn(List.of(id));
        wishlistItemRepository.deleteByProductIdIn(List.of(id));
        inventoryRepository.deleteByProductIdIn(List.of(id));
        productRepository.delete(product);
    }

    private Product buildProduct(Product product, ProductRequest request) {
        product.setSlug(request.slug());
        product.setName(request.name());
        product.setBrand(request.brand());
        product.setBrandLogoUrl(emptyToNull(request.brandLogoUrl()));
        product.setCategory(categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found")));
        product.setPrice(request.price());
        product.setOriginalPrice(request.originalPrice());
        product.setShortDescription(request.shortDescription());
        product.setDescription(request.description());
        product.setRating(request.rating());
        product.setReviewCount(request.reviewCount());
        product.setFeatured(request.featured());
        product.setBestSeller(request.bestSeller());
        product.setNewArrival(request.newArrival());
        product.setBulkEligible(request.bulkEligible());
        product.setWarrantyAvailable(request.warrantyAvailable());
        product.setReplacementAvailable(request.replacementAvailable());
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
        if ("discount-high".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Order.desc("originalPrice"), Sort.Order.asc("price"));
        }
        if ("name-asc".equalsIgnoreCase(sort)) {
            return Sort.by("name").ascending();
        }
        if ("name-desc".equalsIgnoreCase(sort)) {
            return Sort.by("name").descending();
        }
        return Sort.by(Sort.Order.desc("featured"), Sort.Order.desc("createdAt"));
    }

    private Comparator<ProductResponse> resolveComparator(String sort) {
        if ("price-low".equalsIgnoreCase(sort)) {
            return Comparator.comparing(ProductResponse::price);
        }
        if ("price-high".equalsIgnoreCase(sort)) {
            return Comparator.comparing(ProductResponse::price).reversed();
        }
        if ("rating".equalsIgnoreCase(sort)) {
            return Comparator.comparing(ProductResponse::rating).reversed();
        }
        if ("newest".equalsIgnoreCase(sort)) {
            return Comparator.comparing(ProductResponse::newArrival).reversed()
                    .thenComparing(ProductResponse::featured, Comparator.reverseOrder());
        }
        if ("discount-high".equalsIgnoreCase(sort)) {
            return Comparator.comparing(ProductResponse::discountPercentage).reversed();
        }
        if ("name-asc".equalsIgnoreCase(sort)) {
            return Comparator.comparing(ProductResponse::name, String.CASE_INSENSITIVE_ORDER);
        }
        if ("name-desc".equalsIgnoreCase(sort)) {
            return Comparator.comparing(ProductResponse::name, String.CASE_INSENSITIVE_ORDER).reversed();
        }
        return Comparator.comparing(ProductResponse::featured).reversed()
                .thenComparing(ProductResponse::newArrival, Comparator.reverseOrder());
    }

    private String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private boolean matchesCategory(ProductResponse product, String category) {
        String normalizedCategory = emptyToNull(category);
        if (normalizedCategory == null) {
            return true;
        }
        return product.categorySlug().equalsIgnoreCase(normalizedCategory)
                || product.subcategorySlug().equalsIgnoreCase(normalizedCategory)
                || product.category().equalsIgnoreCase(normalizedCategory)
                || product.subcategory().equalsIgnoreCase(normalizedCategory);
    }

    private boolean matchesSearch(ProductResponse product, String search) {
        String normalizedSearch = emptyToNull(search);
        if (normalizedSearch == null) {
            return true;
        }
        String query = normalizedSearch.toLowerCase();
        return product.name().toLowerCase().contains(query)
                || product.brand().toLowerCase().contains(query)
                || product.category().toLowerCase().contains(query)
                || product.subcategory().toLowerCase().contains(query)
                || product.tags().stream().anyMatch(tag -> tag.toLowerCase().contains(query));
    }

    private boolean matchesBrand(ProductResponse product, String brand) {
        String normalizedBrand = emptyToNull(brand);
        return normalizedBrand == null || product.brand().equalsIgnoreCase(normalizedBrand);
    }

    private boolean matchesPrice(ProductResponse product, BigDecimal minPrice, BigDecimal maxPrice) {
        boolean aboveMin = minPrice == null || product.price().compareTo(minPrice) >= 0;
        boolean belowMax = maxPrice == null || product.price().compareTo(maxPrice) <= 0;
        return aboveMin && belowMax;
    }

    private boolean matchesDiscount(ProductResponse product, Integer minDiscount) {
        return minDiscount == null || product.discountPercentage() >= minDiscount;
    }

    private boolean matchesAvailability(ProductResponse product, String availability) {
        String normalizedAvailability = emptyToNull(availability);
        if (normalizedAvailability == null || "all".equalsIgnoreCase(normalizedAvailability)) {
            return true;
        }
        return switch (normalizedAvailability.toLowerCase()) {
            case "in-stock" -> product.stockQuantity() > 0 && !product.lowStock();
            case "low-stock" -> product.stockQuantity() > 0 && product.lowStock();
            case "out-of-stock" -> product.stockQuantity() <= 0;
            default -> true;
        };
    }
}
