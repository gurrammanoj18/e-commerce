package com.voltmart.ecommerce.config;

import com.voltmart.ecommerce.entity.*;
import com.voltmart.ecommerce.entity.enums.Role;
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
            "components",
            "electrical-appliances",
            "hardware-products",
            "cleaning-products",
            "home-utility-products",
            "tools-accessories"
    );

    private final CartItemRepository cartItemRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderItemRepository orderItemRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ServiceablePincodeRepository serviceablePincodeRepository;
    private final BrandLogoRepository brandLogoRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;
    @Override
    public void run(String... args) {
        seedUsers();
        seedServiceablePincodes();
        seedBrandLogos();
        removeLegacyCatalog();
        Map<String, Category> categories = seedCategories();
        if (productRepository.count() > 0) {
            return;
        }

        seedProduct("home-ease-mixer", "Home Ease Mixer", "HomeEase", categories.get("kitchen"), "Kitchen essential", "Popular",
                List.of("/catalog/atlas-book.webp", "/catalog/pulse-laptop.webp", "/catalog/dock-station.webp"),
                BigDecimal.valueOf(4299), BigDecimal.valueOf(4999), 25, true, false, true, true, true,
                List.of("everyday-essentials", "summer"));

        seedProduct("utility-storage-rack", "Utility Storage Rack", "HouseLine", categories.get("hardware"), "Home organization", "New",
                List.of("/catalog/dock-station.webp", "/catalog/atlas-book.webp", "/catalog/lumen-monitor.webp"),
                BigDecimal.valueOf(3499), BigDecimal.valueOf(3999), 18, true, false, true, true, false,
                List.of("hardware-tools", "contractor-deals"));

        seedProduct("pro-grip-tool-kit", "Pro Grip Tool Kit", "ForgeMax", categories.get("power-hand-tools"), "Workshop-ready", "Top rated",
                List.of("/catalog/vector-keyboard.webp", "/catalog/quantum-gpu.webp", "/catalog/dock-station.webp"),
                BigDecimal.valueOf(2799), BigDecimal.valueOf(3299), 38, false, true, false, true, false,
                List.of("hardware-tools", "contractor-deals"));

        seedProduct("steel-fix-fastener-set", "Steel Fix Fastener Set", "Hardline", categories.get("hardware"), "Durable hardware", "Featured",
                List.of("/catalog/quantum-gpu.webp", "/catalog/vector-keyboard.webp", "/catalog/dock-station.webp"),
                BigDecimal.valueOf(699), BigDecimal.valueOf(849), 140, false, true, false, true, false,
                List.of("hard-to-find-products", "contractor-deals"));

        seedProduct("fresh-wipe-floor-cleaner", "Fresh Wipe Floor Cleaner", "PureNest", categories.get("bathroom"), "Daily cleaning", "Value pick",
                List.of("/catalog/orbit-camera.webp", "/catalog/forge-speaker.webp", "/catalog/dock-station.webp"),
                BigDecimal.valueOf(349), BigDecimal.valueOf(399), 96, false, true, true, true, false,
                List.of("everyday-essentials", "monsoon"));

        seedProduct("flowguard-bath-fitting", "FlowGuard Bath Fitting", "AquaLine", categories.get("plumbing"), "Bathroom upgrade", "Featured",
                List.of("/catalog/mesh-router.webp", "/catalog/orbit-camera.webp", "/catalog/dock-station.webp"),
                BigDecimal.valueOf(2199), BigDecimal.valueOf(2599), 22, true, false, true, true, true,
                List.of("plumbing-bathroom", "monsoon"));

        seedProduct("wiremaster-led-bulb", "WireMaster LED Bulb", "VoltMart", categories.get("lighting-fans"), "Lighting essential", "New",
                List.of("/catalog/lumen-monitor.webp", "/catalog/orbit-camera.webp", "/catalog/dock-station.webp"),
                BigDecimal.valueOf(199), BigDecimal.valueOf(249), 320, true, false, true, true, false,
                List.of("electrical-essentials", "everyday-essentials", "lighting", "summer"));

        seedProduct("volt-guard-mcb-box", "VoltGuard MCB Box", "CircuitPro", categories.get("electricals"), "Project essential", "Featured",
                List.of("/catalog/quantum-gpu.webp", "/catalog/dock-station.webp", "/catalog/vector-keyboard.webp"),
                BigDecimal.valueOf(1499), BigDecimal.valueOf(1799), 54, false, true, false, true, true,
                List.of("hard-to-find-products", "electrical-essentials", "contractor-deals"));

        seedProduct("seal-pro-pipe-kit", "Seal Pro Pipe Kit", "AquaLine", categories.get("plumbing"), "Monsoon ready", "New",
                List.of("/catalog/mesh-router.webp", "/catalog/forge-speaker.webp", "/catalog/orbit-camera.webp"),
                BigDecimal.valueOf(899), BigDecimal.valueOf(1099), 66, false, true, true, true, true,
                List.of("plumbing-bathroom", "monsoon", "hard-to-find-products"));

        seedProduct("anchor-lite-switch-set", "Anchor Lite Switch Set", "Anchor", categories.get("electricals"), "Everyday electrical", "Popular",
                List.of("/catalog/dock-station.webp", "/catalog/vector-keyboard.webp", "/catalog/lumen-monitor.webp"),
                BigDecimal.valueOf(599), BigDecimal.valueOf(799), 88, true, false, true, true, true,
                List.of("everyday-essentials", "electrical-essentials", "lighting"));
    }

    private Map<String, Category> seedCategories() {
        Map<String, Category> categories = new LinkedHashMap<>();

        categories.put("appliances", upsertCategory("Appliances", "appliances", "Essential machines and home-use appliances for daily living.", "🧺", null));
        categories.put("electricals", upsertCategory("Electricals", "electricals", "Switches, wiring, connectors, and electrical essentials.", "🔌", null));
        categories.put("power-hand-tools", upsertCategory("Power & Hand Tools", "power-hand-tools", "Repair kits, workshop tools, and job-ready equipment.", "🛠️", null));
        categories.put("hardware", upsertCategory("Hardware", "hardware", "Fasteners, brackets, fixtures, and durable installation essentials.", "🔩", null));
        categories.put("lighting-fans", upsertCategory("Lighting & Fans", "lighting-fans", "Lighting fixtures, bulbs, and fan solutions for every room.", "💡", null));
        categories.put("bathroom", upsertCategory("Bathroom", "bathroom", "Bathroom care, fittings, and everyday utility products.", "🚿", null));
        categories.put("plumbing", upsertCategory("Plumbing", "plumbing", "Pipes, valves, fittings, and flow-control solutions.", "🚰", null));
        categories.put("kitchen", upsertCategory("Kitchen", "kitchen", "Kitchen appliances, storage, and prep essentials.", "🍽️", null));
        categories.put("services", upsertCategory("Services", "services", "Book trusted home and site services from verified professionals.", "🧰", null));
        categories.put("diwali-offer", upsertCategory(
                "Diwali Offer",
                "diwali-offer",
                "Festival deals and seasonal savings curated for quick browsing.",
                "🎆",
                null,
                true
        ));
        categories.put("50-off-diwali-season", upsertCategory(
                "50% Off Diwali Season",
                "50-off-diwali-season",
                "Seasonal promotion spot for limited-time festival savings.",
                "🏷️",
                null,
                true
        ));

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
        return upsertCategory(name, slug, description, icon, parent, false);
    }

    private Category upsertCategory(String name, String slug, String description, String icon, Category parent, boolean showInNavbar) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseGet(() -> Category.builder().slug(slug).build());
        category.setName(name);
        category.setSlug(slug);
        category.setDescription(description);
        category.setIcon(icon);
        category.setShowInNavbar(showInNavbar);
        category.setParent(parent);
        return categoryRepository.save(category);
    }

    private void seedUsers() {
        String adminEmail = appProperties.getSeed().getAdminEmail();
        String adminPassword = appProperties.getSeed().getAdminPassword();
        User admin = userRepository.findByEmailIgnoreCase(adminEmail)
                .orElseGet(() -> User.builder()
                        .createdAt(LocalDateTime.now())
                        .build());
        admin.setFullName("VoltMart Admin");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ROLE_ADMIN);
        admin.setWalletBalance(BigDecimal.ZERO);
        if (admin.getCreatedAt() == null) {
            admin.setCreatedAt(LocalDateTime.now());
        }
        userRepository.save(admin);
    }

    private void seedServiceablePincodes() {
        serviceablePincodeRepository.findByPincode("500074")
                .orElseGet(() -> serviceablePincodeRepository.save(ServiceablePincode.builder()
                        .pincode("500074")
                        .label("Default home delivery zone")
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()));
    }

    private void seedBrandLogos() {
        if (brandLogoRepository.count() > 0) {
            return;
        }
        seedBrandLogo("Anchor", "/brand-logos/anchor-p.jpg", 10);
        seedBrandLogo("GM", "/brand-logos/gm.png", 20);
        seedBrandLogo("Havells", "/brand-logos/havells.jpg", 30);
        seedBrandLogo("Polycab", "/brand-logos/poly.jpg", 40);
        seedBrandLogo("Finolex", "/brand-logos/finolex.jpg", 50);
        seedBrandLogo("Legrand", "/brand-logos/legrand.jpg", 60);
        seedBrandLogo("Philips", "/brand-logos/philips.jpg", 70);
        seedBrandLogo("Godrej", "/brand-logos/godrej.jpg", 80);
    }

    private void seedBrandLogo(String brandName, String logoUrl, int displayOrder) {
        if (brandLogoRepository.findByBrandNameIgnoreCase(brandName).isPresent()) {
            return;
        }

        brandLogoRepository.save(BrandLogo.builder()
                .brandName(brandName)
                .logoUrl(logoUrl)
                .displayOrder(displayOrder)
                .active(true)
                .build());
    }

    private void seedProduct(String slug, String name, String brand, Category category, String heroTag, String badge,
                             List<String> images, BigDecimal price, BigDecimal originalPrice, int stockQuantity,
                             boolean featured, boolean bestSeller, boolean newArrival, boolean bulkEligible,
                             boolean warrantyAvailable, List<String> customTags) {
        if (category == null) {
            throw new IllegalStateException("Seed category missing for product " + slug);
        }

        List<String> tags = new java.util.ArrayList<>();
        tags.add(category.getName().toLowerCase());
        tags.add(brand.toLowerCase());
        tags.add("hardware");
        if (customTags != null) {
            tags.addAll(customTags);
        }

        Product product = productRepository.save(Product.builder()
                .slug(slug)
                .name(name)
                .brand(brand)
                .brandLogoUrl(defaultBrandLogoUrl(brand))
                .category(category)
                .price(price)
                .originalPrice(originalPrice)
                .shortDescription("Professional hardware crafted for high-performance ecommerce demos.")
                .description("A production-ready seeded product to support catalog browsing, search, filters, cart, and checkout flows.")
                .rating(4.8)
                .reviewCount(120)
                .featured(featured)
                .bestSeller(bestSeller)
                .newArrival(newArrival)
                .bulkEligible(bulkEligible)
                .warrantyAvailable(warrantyAvailable)
                .replacementAvailable(true)
                .badge(badge)
                .heroTag(heroTag)
                .imageUrls(images)
                .tags(tags)
                .createdAt(LocalDateTime.now())
                .build());

        inventoryRepository.save(Inventory.builder()
                .product(product)
                .stockQuantity(stockQuantity)
                .lowStockThreshold(5)
                .updatedAt(LocalDateTime.now())
                .build());
    }

    private String defaultBrandLogoUrl(String brand) {
        return switch (brand.toLowerCase()) {
            case "anchor" -> "https://logo.clearbit.com/anchor-world.com";
            case "gm" -> "https://logo.clearbit.com/gmmodular.com";
            case "havells" -> "https://logo.clearbit.com/havells.com";
            case "polycab" -> "https://logo.clearbit.com/polycab.com";
            case "finolex" -> "https://logo.clearbit.com/finolex.com";
            case "legrand" -> "https://logo.clearbit.com/legrand.co.in";
            case "philips" -> "https://logo.clearbit.com/philips.com";
            case "godrej" -> "https://logo.clearbit.com/godrej.com";
            default -> null;
        };
    }
}
