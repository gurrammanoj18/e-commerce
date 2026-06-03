package com.voltmart.ecommerce.mapper;

import com.voltmart.ecommerce.config.AppProperties;
import com.voltmart.ecommerce.dto.cart.CartItemResponse;
import com.voltmart.ecommerce.dto.cart.CartResponse;
import com.voltmart.ecommerce.dto.category.CategoryResponse;
import com.voltmart.ecommerce.dto.order.OrderItemResponse;
import com.voltmart.ecommerce.dto.order.OrderResponse;
import com.voltmart.ecommerce.dto.product.ProductResponse;
import com.voltmart.ecommerce.dto.user.UserResponse;
import com.voltmart.ecommerce.dto.wishlist.WishlistItemResponse;
import com.voltmart.ecommerce.dto.wishlist.WishlistResponse;
import com.voltmart.ecommerce.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class EntityMapper {

    private final AppProperties appProperties;

    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getProfileImageUrl(),
                user.getRole().name(),
                user.getPreferredDeliveryMode() == null ? null : user.getPreferredDeliveryMode().name(),
                user.getWalletBalance()
        );
    }

    public ProductResponse toProductResponse(Product product, Inventory inventory) {
        Category leafCategory = product.getCategory();
        Category parentCategory = leafCategory.getParent() == null ? leafCategory : leafCategory.getParent();
        int discountPercentage = product.getOriginalPrice() != null
                && product.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0
                && product.getOriginalPrice().compareTo(product.getPrice()) > 0
                ? product.getOriginalPrice()
                    .subtract(product.getPrice())
                    .multiply(BigDecimal.valueOf(100))
                    .divide(product.getOriginalPrice(), 0, RoundingMode.HALF_UP)
                    .intValue()
                : 0;

        return new ProductResponse(
                product.getId(),
                product.getSlug(),
                product.getName(),
                product.getBrand(),
                product.getBrandLogoUrl(),
                parentCategory.getName(),
                parentCategory.getSlug(),
                leafCategory.getName(),
                leafCategory.getSlug(),
                leafCategory.getId(),
                product.getPrice(),
                product.getOriginalPrice(),
                product.getShortDescription(),
                product.getDescription(),
                product.getRating(),
                product.getReviewCount(),
                inventory.getStockQuantity(),
                inventory.getStockQuantity() <= inventory.getLowStockThreshold(),
                discountPercentage,
                product.getWarrantyAvailable(),
                product.getReplacementAvailable(),
                product.getFeatured(),
                product.getBestSeller(),
                product.getNewArrival(),
                product.getBulkEligible(),
                product.getBadge(),
                product.getHeroTag(),
                product.getImageUrls(),
                product.getTags()
        );
    }

    public CategoryResponse toCategoryResponse(
            Category category,
            long productCount,
            List<CategoryResponse> subcategories
    ) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getIcon(),
                category.getImage(),
                category.isShowInNavbar(),
                category.getParent() == null ? null : category.getParent().getId(),
                category.getChildren().isEmpty(),
                productCount,
                subcategories
        );
    }

    public CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream().map(item ->
                new CartItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getSlug(),
                        item.getProduct().getImageUrls().isEmpty() ? "" : item.getProduct().getImageUrls().getFirst(),
                        item.getProduct().getPrice(),
                        item.getQuantity(),
                        item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())),
                        item.getProduct().getId() != null ? 0 : 0
                )
        ).toList();

        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(cart.getId(), items, items.stream().mapToInt(CartItemResponse::quantity).sum(), subtotal);
    }

    public WishlistResponse toWishlistResponse(Wishlist wishlist, Map<Long, Inventory> inventoryByProductId) {
        List<WishlistItemResponse> items = wishlist.getItems().stream()
                .map(item -> new WishlistItemResponse(item.getId(), item.getProduct().getId(), item.getCreatedAt()))
                .toList();
        List<ProductResponse> products = wishlist.getItems().stream()
                .map(WishlistItem::getProduct)
                .map(product -> toProductResponse(
                        product,
                        inventoryByProductId.get(product.getId())
                ))
                .toList();

        return new WishlistResponse(wishlist.getId(), items, products, items.size());
    }

    public OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProduct().getName(),
                        item.getProduct().getSlug(),
                        item.getProduct().getImageUrls().isEmpty() ? "" : item.getProduct().getImageUrls().getFirst(),
                        item.getQuantity(),
                        item.getUnitPrice()
                ))
                .toList();
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber().toString(),
                order.getStatus().name(),
                order.getDeliveryMode().name(),
                order.getShippingName(),
                order.getEmail(),
                order.getPhone(),
                order.getShippingAddress(),
                order.getCity(),
                order.getPostalCode(),
                order.getUserAddress() == null ? null : order.getUserAddress().getId(),
                order.getDeliverySlot(),
                order.isPriorityOrder(),
                order.getPriorityNotes(),
                order.getSubtotal(),
                order.getShippingCost(),
                order.getTaxAmount(),
                order.getTotalAmount(),
                order.getWalletDebitAmount() == null ? BigDecimal.ZERO : order.getWalletDebitAmount(),
                order.getAppliedCouponCode(),
                order.getAppliedDiscountAmount() == null ? BigDecimal.ZERO : order.getAppliedDiscountAmount(),
                order.getWalletCreditAmount(),
                order.getWalletCreditEligibleAt(),
                order.isWalletCreditProcessed(),
                buildWhatsappMessage(order),
                order.getCreatedAt(),
                items
        );
    }

    private String buildWhatsappMessage(Order order) {
        String message = "Track order " + order.getOrderNumber() + " - status: " + order.getStatus();
        return "https://wa.me/" + appProperties.getWhatsapp().getSupportNumber() + "?text=" +
                URLEncoder.encode(message, StandardCharsets.UTF_8);
    }
}
