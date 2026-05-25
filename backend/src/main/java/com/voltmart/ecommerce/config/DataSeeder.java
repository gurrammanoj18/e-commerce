package com.voltmart.ecommerce.config;

import com.voltmart.ecommerce.entity.*;
import com.voltmart.ecommerce.entity.enums.Role;
import com.voltmart.ecommerce.mapper.EntityMapper;
import com.voltmart.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@Order(10)
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private static final List<String> LEGACY_CATEGORY_SLUGS = List.of(
            "laptops",
            "audio",
            "networking",
            "components"
    );

    private final CartItemRepository cartItemRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderItemRepository orderItemRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityMapper entityMapper;

    @Override
    public void run(String... args) {
        seedUsers();
        removeLegacyCatalog();
        Map<String, Category> categories = seedCategories();
        if (productRepository.count() > 0) {
            return;
        }

        seedProduct("home-ease-mixer", "Home Ease Mixer", "HomeEase", categories.get("electrical-appliances"), "Kitchen essential", "Popular",
                List.of("/catalog/atlas-book.webp", "/catalog/pulse-laptop.webp", "/catalog/dock-station.webp"),
                Map.of("Power", "750W", "Jars", "3 stainless steel", "Warranty", "2 years"),
                BigDecimal.valueOf(4299), BigDecimal.valueOf(4999), 25, true, false, true, true);

        seedProduct("utility-storage-rack", "Utility Storage Rack", "HouseLine", categories.get("home-utility-products"), "Home organization", "New",
                List.of("/catalog/dock-station.webp", "/catalog/atlas-book.webp", "/catalog/lumen-monitor.webp"),
                Map.of("Material", "Powder-coated steel", "Shelves", "5", "Load Capacity", "120kg"),
                BigDecimal.valueOf(3499), BigDecimal.valueOf(3999), 18, true, false, true, true);

        seedProduct("pro-grip-tool-kit", "Pro Grip Tool Kit", "ForgeMax", categories.get("tools-accessories"), "Workshop-ready", "Top rated",
                List.of("/catalog/vector-keyboard.webp", "/catalog/quantum-gpu.webp", "/catalog/dock-station.webp"),
                Map.of("Pieces", "46", "Case", "Impact-resistant", "Use", "Home and workshop"),
                BigDecimal.valueOf(2799), BigDecimal.valueOf(3299), 38, false, true, false, true);

        seedProduct("steel-fix-fastener-set", "Steel Fix Fastener Set", "Hardline", categories.get("hardware-products"), "Durable hardware", "Featured",
                List.of("/catalog/quantum-gpu.webp", "/catalog/vector-keyboard.webp", "/catalog/dock-station.webp"),
                Map.of("Material", "Stainless steel", "Pack Size", "120 pieces", "Finish", "Rust resistant"),
                BigDecimal.valueOf(699), BigDecimal.valueOf(849), 140, false, true, false, true);

        seedProduct("fresh-wipe-floor-cleaner", "Fresh Wipe Floor Cleaner", "PureNest", categories.get("cleaning-products"), "Daily cleaning", "Value pick",
                List.of("/catalog/orbit-camera.webp", "/catalog/forge-speaker.webp", "/catalog/dock-station.webp"),
                Map.of("Volume", "2L", "Surface", "Tiles and marble", "Fragrance", "Citrus"),
                BigDecimal.valueOf(349), BigDecimal.valueOf(399), 96, false, true, true, true);

        seedProduct("flowguard-bath-fitting", "FlowGuard Bath Fitting", "AquaLine", categories.get("home-utility-products"), "Bathroom upgrade", "Featured",
                List.of("/catalog/mesh-router.webp", "/catalog/orbit-camera.webp", "/catalog/dock-station.webp"),
                Map.of("Finish", "Chrome", "Mount", "Wall mount", "Warranty", "5 years"),
                BigDecimal.valueOf(2199), BigDecimal.valueOf(2599), 22, true, false, true, true);
    }

    private Map<String, Category> seedCategories() {
        Map<String, Category> categories = new LinkedHashMap<>();

        categories.put("electrical-appliances", upsertCategory("Electrical Appliances", "electrical-appliances", "Mixer, grinder, and everyday powered home products.", "🔌", null));
        categories.put("hardware-products", upsertCategory("Hardware Products", "hardware-products", "Locks, fasteners, brackets, and durable hardware essentials.", "🔩", null));
        categories.put("cleaning-products", upsertCategory("Cleaning Products", "cleaning-products", "Cleaning, maintenance, and care essentials.", "🧼", null));
        categories.put("home-utility-products", upsertCategory("Home Utility Products", "home-utility-products", "Household utility and organization products.", "🏠", null));
        categories.put("tools-accessories", upsertCategory("Tools & Accessories", "tools-accessories", "Hand tools, kits, and repair accessories.", "🛠️", null));

        return categories;
    }

    private void removeLegacyCatalog() {
        List<Product> legacyProducts = productRepository.findByCategorySlugIn(LEGACY_CATEGORY_SLUGS);
        if (!legacyProducts.isEmpty()) {
            List<Long> productIds = legacyProducts.stream()
                    .map(Product::getId)
                    .toList();
            cartItemRepository.deleteByProductIdIn(productIds);
            orderItemRepository.deleteByProductIdIn(productIds);
            wishlistItemRepository.deleteByProductIdIn(productIds);
            inventoryRepository.deleteByProductIdIn(productIds);
            productRepository.deleteAll(legacyProducts);
        }

        List<Category> legacyCategories = categoryRepository.findBySlugIn(LEGACY_CATEGORY_SLUGS);
        if (!legacyCategories.isEmpty()) {
            categoryRepository.deleteAll(legacyCategories);
        }
    }

    private Category upsertCategory(String name, String slug, String description, String icon, Category parent) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseGet(() -> Category.builder().slug(slug).build());
        category.setName(name);
        category.setSlug(slug);
        category.setDescription(description);
        category.setIcon(icon);
        category.setParent(parent);
        return categoryRepository.save(category);
    }

    private void seedUsers() {
        User admin = userRepository.findByEmail("admin@voltmart.in")
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName("VoltMart Admin")
                        .email("admin@voltmart.in")
                        .password(passwordEncoder.encode("Admin@123"))
                        .role(Role.ROLE_ADMIN)
                        .createdAt(LocalDateTime.now())
                        .build()));
        User customer = userRepository.findByEmail("customer@voltmart.in")
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName("Demo Customer")
                        .email("customer@voltmart.in")
                        .password(passwordEncoder.encode("Customer@123"))
                        .role(Role.ROLE_CUSTOMER)
                        .createdAt(LocalDateTime.now())
                        .build()));

        cartRepository.findByUserId(admin.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(admin).build()));
        cartRepository.findByUserId(customer.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(customer).build()));
        wishlistRepository.findByUserId(admin.getId())
                .orElseGet(() -> wishlistRepository.save(Wishlist.builder().user(admin).build()));
        wishlistRepository.findByUserId(customer.getId())
                .orElseGet(() -> wishlistRepository.save(Wishlist.builder().user(customer).build()));
    }

    private void seedProduct(String slug, String name, String brand, Category category, String heroTag, String badge,
                             List<String> images, Map<String, String> specifications, BigDecimal price, BigDecimal originalPrice,
                             int stockQuantity, boolean featured, boolean bestSeller, boolean newArrival, boolean bulkEligible) {
        if (category == null) {
            throw new IllegalStateException("Seed category missing for product " + slug);
        }

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
                .warrantyAvailable(specifications.keySet().stream().anyMatch(key -> key.equalsIgnoreCase("Warranty")))
                .replacementAvailable(true)
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
