package com.voltmart.ecommerce.config;

import com.voltmart.ecommerce.entity.*;
import com.voltmart.ecommerce.entity.enums.Role;
import com.voltmart.ecommerce.mapper.EntityMapper;
import com.voltmart.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityMapper entityMapper;

    @Override
    public void run(String... args) {
        seedUsers();
        if (categoryRepository.count() > 0 || productRepository.count() > 0) {
            return;
        }

        Category laptops = categoryRepository.save(Category.builder().name("Laptops").slug("laptops").description("Portable productivity hardware").icon("💻").build());
        Category audio = categoryRepository.save(Category.builder().name("Audio").slug("audio").description("Headphones and speakers").icon("🎧").build());
        Category networking = categoryRepository.save(Category.builder().name("Networking").slug("networking").description("Wi-Fi and office connectivity").icon("📡").build());
        Category components = categoryRepository.save(Category.builder().name("Components").slug("components").description("Displays and upgrade parts").icon("🧩").build());

        seedProduct("atlas-pro-14", "Atlas Pro 14 Laptop", "VoltForge", laptops, "Workstation ready", "Featured",
                List.of("/catalog/atlas-book.webp", "/catalog/pulse-laptop.webp", "/catalog/lumen-monitor.webp"),
                Map.of("Processor", "Intel Core Ultra 7", "Memory", "16GB DDR5", "Storage", "1TB SSD"),
                BigDecimal.valueOf(94999), BigDecimal.valueOf(102999), 18, true, true, true, true);

        seedProduct("sonicpulse-x9-headphones", "SonicPulse X9 Headphones", "SonicPulse", audio, "Immersive audio", "Best seller",
                List.of("/catalog/sonic-headset.webp", "/catalog/forge-speaker.webp", "/catalog/dock-station.webp"),
                Map.of("Battery", "35 hours", "Driver", "40mm", "Connectivity", "BT 5.3"),
                BigDecimal.valueOf(18999), BigDecimal.valueOf(22999), 34, true, true, false, false);

        seedProduct("nova-mesh-6-router", "Nova Mesh 6 Router", "NetSphere", networking, "Reliable connectivity", "Popular",
                List.of("/catalog/nova-router.webp", "/catalog/mesh-router.webp", "/catalog/orbit-camera.webp"),
                Map.of("Wi-Fi", "AX3000", "Coverage", "2,500 sq.ft", "Security", "WPA3"),
                BigDecimal.valueOf(12999), BigDecimal.valueOf(14999), 28, true, false, true, true);

        seedProduct("lumenview-27-monitor", "LumenView 27 Monitor", "PixelCraft", components, "Desk upgrade", "New",
                List.of("/catalog/lumen-monitor.webp", "/catalog/dock-station.webp", "/catalog/atlas-book.webp"),
                Map.of("Resolution", "2560x1440", "Refresh rate", "100Hz", "Panel", "IPS"),
                BigDecimal.valueOf(24999), BigDecimal.valueOf(28999), 16, true, false, true, true);
    }

    private void seedUsers() {
        if (userRepository.existsByEmail("admin@voltmart.in")) {
            return;
        }

        User admin = userRepository.save(User.builder()
                .fullName("VoltMart Admin")
                .email("admin@voltmart.in")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ROLE_ADMIN)
                .createdAt(LocalDateTime.now())
                .build());
        User customer = userRepository.save(User.builder()
                .fullName("Demo Customer")
                .email("customer@voltmart.in")
                .password(passwordEncoder.encode("Customer@123"))
                .role(Role.ROLE_CUSTOMER)
                .createdAt(LocalDateTime.now())
                .build());

        cartRepository.save(Cart.builder().user(admin).build());
        cartRepository.save(Cart.builder().user(customer).build());
    }

    private void seedProduct(String slug, String name, String brand, Category category, String heroTag, String badge,
                             List<String> images, Map<String, String> specifications, BigDecimal price, BigDecimal originalPrice,
                             int stockQuantity, boolean featured, boolean bestSeller, boolean newArrival, boolean bulkEligible) {
        Product product = productRepository.save(Product.builder()
                .slug(slug)
                .name(name)
                .brand(brand)
                .category(category)
                .price(price)
                .originalPrice(originalPrice)
                .shortDescription("Professional hardware crafted for high-performance ecommerce demos.")
                .description("A production-ready seeded product to support catalog browsing, search, filters, cart, and checkout flows.")
                .specifications(entityMapper.writeSpecifications(specifications))
                .rating(4.8)
                .reviewCount(120)
                .featured(featured)
                .bestSeller(bestSeller)
                .newArrival(newArrival)
                .bulkEligible(bulkEligible)
                .badge(badge)
                .heroTag(heroTag)
                .imageUrls(images)
                .tags(List.of(category.getName().toLowerCase(), brand.toLowerCase(), "hardware"))
                .createdAt(LocalDateTime.now())
                .build());

        inventoryRepository.save(Inventory.builder()
                .product(product)
                .stockQuantity(stockQuantity)
                .lowStockThreshold(5)
                .updatedAt(LocalDateTime.now())
                .build());
    }
}
