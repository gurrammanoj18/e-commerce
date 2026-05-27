package com.voltmart.ecommerce.controller.admin;

import com.voltmart.ecommerce.dto.banner.BannerRequest;
import com.voltmart.ecommerce.dto.banner.BannerResponse;
import com.voltmart.ecommerce.dto.bulk.BulkInquiryUpdateRequest;
import com.voltmart.ecommerce.dto.bulk.BulkOrderResponse;
import com.voltmart.ecommerce.dto.category.CategoryRequest;
import com.voltmart.ecommerce.dto.category.CategoryResponse;
import com.voltmart.ecommerce.dto.order.OrderResponse;
import com.voltmart.ecommerce.dto.product.InventoryResponse;
import com.voltmart.ecommerce.dto.product.ProductRequest;
import com.voltmart.ecommerce.dto.product.ProductResponse;
import com.voltmart.ecommerce.dto.user.AdminUserResponse;
import com.voltmart.ecommerce.service.AdminService;
import com.voltmart.ecommerce.service.BannerService;
import com.voltmart.ecommerce.service.BulkOrderService;
import com.voltmart.ecommerce.service.CategoryService;
import com.voltmart.ecommerce.service.OrderService;
import com.voltmart.ecommerce.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminService adminService;
    private final ProductService productService;
    private final OrderService orderService;
    private final CategoryService categoryService;
    private final BannerService bannerService;
    private final BulkOrderService bulkOrderService;

    @GetMapping("/dashboard")
    public Map<String, Object> getOverview() {
        return adminService.getDashboardOverview();
    }

    @GetMapping("/users")
    public List<AdminUserResponse> getUsers() {
        return adminService.getUsers();
    }

    @GetMapping("/inventory")
    public List<InventoryResponse> getInventory() {
        return adminService.getInventory();
    }

    @GetMapping("/categories")
    public List<CategoryResponse> getCategories() {
        return categoryService.getCategories();
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse createCategory(@Valid @RequestBody CategoryRequest request) {
        return categoryService.createCategory(request);
    }

    @PutMapping("/categories/{id}")
    public CategoryResponse updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return categoryService.updateCategory(id, request);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }

    @GetMapping("/products")
    public List<ProductResponse> getProducts() {
        return productService.getAllProducts();
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@Valid @RequestBody ProductRequest request) {
        return productService.createProduct(request);
    }

    @PutMapping("/products/{id}")
    public ProductResponse updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @GetMapping("/orders")
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PatchMapping("/orders/{orderId}")
    public OrderResponse updateOrderStatus(@PathVariable Long orderId, @RequestParam String status) {
        return orderService.updateOrderStatus(orderId, status);
    }

    @DeleteMapping("/orders/{orderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
    }

    @GetMapping("/banners")
    public List<BannerResponse> getBanners() {
        return bannerService.getAllBanners();
    }

    @PostMapping("/banners")
    @ResponseStatus(HttpStatus.CREATED)
    public BannerResponse createBanner(@Valid @RequestBody BannerRequest request) {
        return bannerService.createBanner(request);
    }

    @PutMapping("/banners/{id}")
    public BannerResponse updateBanner(@PathVariable Long id, @Valid @RequestBody BannerRequest request) {
        return bannerService.updateBanner(id, request);
    }

    @DeleteMapping("/banners/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
    }

    @GetMapping("/bulk-inquiries")
    public List<BulkOrderResponse> getBulkInquiries() {
        return bulkOrderService.getAllInquiries();
    }

    @PatchMapping("/bulk-inquiries/{id}")
    public BulkOrderResponse updateBulkInquiry(@PathVariable Long id, @RequestBody BulkInquiryUpdateRequest request) {
        return bulkOrderService.updateInquiry(id, request);
    }
}
