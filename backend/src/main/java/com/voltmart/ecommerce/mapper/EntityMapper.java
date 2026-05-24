package com.voltmart.ecommerce.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltmart.ecommerce.config.AppProperties;
import com.voltmart.ecommerce.dto.cart.CartItemResponse;
import com.voltmart.ecommerce.dto.cart.CartResponse;
import com.voltmart.ecommerce.dto.category.CategoryResponse;
import com.voltmart.ecommerce.dto.order.OrderItemResponse;
import com.voltmart.ecommerce.dto.order.OrderResponse;
import com.voltmart.ecommerce.dto.product.ProductResponse;
import com.voltmart.ecommerce.dto.user.UserResponse;
import com.voltmart.ecommerce.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class EntityMapper {

    private final ObjectMapper objectMapper;
    private final AppProperties appProperties;

    public UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    public ProductResponse toProductResponse(Product product, Inventory inventory) {
        return new ProductResponse(
                product.getId(),
                product.getSlug(),
                product.getName(),
                product.getBrand(),
                product.getCategory().getName(),
                product.getCategory().getSlug(),
                product.getPrice(),
                product.getOriginalPrice(),
                product.getShortDescription(),
                product.getDescription(),
                readSpecifications(product.getSpecifications()),
                product.getRating(),
                product.getReviewCount(),
                inventory.getStockQuantity(),
                inventory.getStockQuantity() <= inventory.getLowStockThreshold(),
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

    public CategoryResponse toCategoryResponse(Category category, long productCount) {
        return new CategoryResponse(category.getId(), category.getName(), category.getSlug(), category.getDescription(), category.getIcon(), productCount);
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

    public OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderItemResponse(item.getProduct().getName(), item.getProduct().getSlug(), item.getQuantity(), item.getUnitPrice()))
                .toList();
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber().toString(),
                order.getStatus().name(),
                order.getShippingName(),
                order.getEmail(),
                order.getPhone(),
                order.getShippingAddress(),
                order.getCity(),
                order.getPostalCode(),
                order.getSubtotal(),
                order.getShippingCost(),
                order.getTaxAmount(),
                order.getTotalAmount(),
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

    public String writeSpecifications(Map<String, String> specifications) {
        try {
            return objectMapper.writeValueAsString(specifications == null ? Map.of() : specifications);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to serialize specifications", exception);
        }
    }

    private Map<String, String> readSpecifications(String specifications) {
        try {
            return objectMapper.readValue(specifications == null ? "{}" : specifications, new TypeReference<>() {});
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to deserialize specifications", exception);
        }
    }
}
