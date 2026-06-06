package com.voltmart.ecommerce.controller.admin;

import com.voltmart.ecommerce.dto.banner.AdminBannerRequest;
import com.voltmart.ecommerce.dto.banner.BannerResponse;
import com.voltmart.ecommerce.dto.bulk.BulkInquiryUpdateRequest;
import com.voltmart.ecommerce.dto.bulk.BulkOrderResponse;
import com.voltmart.ecommerce.dto.category.CategoryRequest;
import com.voltmart.ecommerce.dto.category.CategoryResponse;
import com.voltmart.ecommerce.dto.homepage.HomepageSectionContentRequest;
import com.voltmart.ecommerce.dto.homepage.HomepageSectionContentResponse;
import com.voltmart.ecommerce.dto.order.OrderResponse;
import com.voltmart.ecommerce.dto.product.InventoryResponse;
import com.voltmart.ecommerce.dto.product.ProductRequest;
import com.voltmart.ecommerce.dto.product.ProductResponse;
import com.voltmart.ecommerce.dto.pincode.ServiceablePincodeRequest;
import com.voltmart.ecommerce.dto.pincode.ServiceablePincodeResponse;
import com.voltmart.ecommerce.dto.returnrequest.ReturnRequestResponse;
import com.voltmart.ecommerce.dto.returnrequest.ReturnRequestUpdateRequest;
import com.voltmart.ecommerce.dto.service.ServiceRequestResponse;
import com.voltmart.ecommerce.dto.user.AdminUserResponse;
import com.voltmart.ecommerce.dto.wallet.WalletCouponRequest;
import com.voltmart.ecommerce.dto.wallet.WalletCouponGrantRequest;
import com.voltmart.ecommerce.dto.wallet.WalletCouponResponse;
import com.voltmart.ecommerce.dto.wallet.WalletCouponRedemptionResponse;
import com.voltmart.ecommerce.service.AdminService;
import com.voltmart.ecommerce.service.BannerService;
import com.voltmart.ecommerce.service.BulkOrderService;
import com.voltmart.ecommerce.service.CategoryService;
import com.voltmart.ecommerce.service.HomepageSectionContentService;
import com.voltmart.ecommerce.service.OrderService;
import com.voltmart.ecommerce.service.ProductService;
import com.voltmart.ecommerce.service.ReturnRequestService;
import com.voltmart.ecommerce.service.ServiceablePincodeService;
import com.voltmart.ecommerce.service.ServiceRequestService;
import com.voltmart.ecommerce.service.WalletService;
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
    private final ServiceRequestService serviceRequestService;
    private final ReturnRequestService returnRequestService;
    private final WalletService walletService;
    private final ServiceablePincodeService serviceablePincodeService;
    private final HomepageSectionContentService homepageSectionContentService;

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
        return bannerService.getHomepageBanners();
    }

    @PostMapping("/banners")
    @ResponseStatus(HttpStatus.CREATED)
    public BannerResponse createBanner(@Valid @RequestBody AdminBannerRequest request) {
        return bannerService.createBanner(request);
    }

    @PutMapping("/banners/{id}")
    public BannerResponse updateBanner(@PathVariable Long id, @Valid @RequestBody AdminBannerRequest request) {
        return bannerService.updateBanner(id, request);
    }

    @DeleteMapping("/banners/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
    }

    @GetMapping("/seasonal-picks")
    public List<BannerResponse> getSeasonalPicks() {
        return bannerService.getSeasonalPicks();
    }

    @PostMapping("/seasonal-picks")
    @ResponseStatus(HttpStatus.CREATED)
    public BannerResponse createSeasonalPick(@Valid @RequestBody AdminBannerRequest request) {
        return bannerService.createSeasonalPick(request);
    }

    @PutMapping("/seasonal-picks/{id}")
    public BannerResponse updateSeasonalPick(@PathVariable Long id, @Valid @RequestBody AdminBannerRequest request) {
        return bannerService.updateBanner(id, request);
    }

    @DeleteMapping("/seasonal-picks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSeasonalPick(@PathVariable Long id) {
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

    @GetMapping("/service-requests")
    public List<ServiceRequestResponse> getServiceRequests() {
        return serviceRequestService.getAllRequests();
    }

    @GetMapping({"/returns", "/return-requests"})
    public List<ReturnRequestResponse> getReturnRequests() {
        return returnRequestService.getAllReturnRequests();
    }

    @PatchMapping({"/return-actions/{id}", "/returns/{id}", "/return-requests/{id}"})
    public ReturnRequestResponse updateReturnRequest(
            @PathVariable Long id,
            @Valid @RequestBody ReturnRequestUpdateRequest request
    ) {
        return returnRequestService.updateReturnRequest(id, request);
    }

    @GetMapping("/wallet-coupons")
    public List<WalletCouponResponse> getWalletCoupons() {
        return walletService.getAllCoupons();
    }

    @PostMapping("/wallet-coupons")
    @ResponseStatus(HttpStatus.CREATED)
    public WalletCouponResponse createWalletCoupon(@Valid @RequestBody WalletCouponRequest request) {
        return walletService.createCoupon(request);
    }

    @PutMapping("/wallet-coupons/{id}")
    public WalletCouponResponse updateWalletCoupon(@PathVariable Long id, @Valid @RequestBody WalletCouponRequest request) {
        return walletService.updateCoupon(id, request);
    }

    @DeleteMapping("/wallet-coupons/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWalletCoupon(@PathVariable Long id) {
        walletService.deleteCoupon(id);
    }

    @GetMapping("/wallet-coupons/{id}/redemptions")
    public List<WalletCouponRedemptionResponse> getWalletCouponRedemptions(@PathVariable Long id) {
        return walletService.getCouponRedemptions(id);
    }

    @PostMapping("/wallet-coupons/{id}/grant")
    public WalletCouponRedemptionResponse grantWalletCouponRedemptions(
            @PathVariable Long id,
            @Valid @RequestBody WalletCouponGrantRequest request
    ) {
        return walletService.grantCouponRedemptions(id, request);
    }

    @GetMapping("/serviceable-pincodes")
    public List<ServiceablePincodeResponse> getServiceablePincodes() {
        return serviceablePincodeService.getAllPincodes();
    }

    @PostMapping("/serviceable-pincodes")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceablePincodeResponse createServiceablePincode(
            @Valid @RequestBody ServiceablePincodeRequest request
    ) {
        return serviceablePincodeService.createPincode(request);
    }

    @PutMapping("/serviceable-pincodes/{id}")
    public ServiceablePincodeResponse updateServiceablePincode(
            @PathVariable Long id,
            @Valid @RequestBody ServiceablePincodeRequest request
    ) {
        return serviceablePincodeService.updatePincode(id, request);
    }

    @DeleteMapping("/serviceable-pincodes/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteServiceablePincode(@PathVariable Long id) {
        serviceablePincodeService.deletePincode(id);
    }

    @GetMapping("/homepage-sections")
    public List<HomepageSectionContentResponse> getHomepageSections() {
        return homepageSectionContentService.getSections();
    }

    @PutMapping("/homepage-sections/{sectionKey}")
    public HomepageSectionContentResponse updateHomepageSection(
            @PathVariable String sectionKey,
            @Valid @RequestBody HomepageSectionContentRequest request
    ) {
        return homepageSectionContentService.updateSection(sectionKey, request);
    }

}
