package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.config.AppProperties;
import com.voltmart.ecommerce.repository.CategoryRepository;
import com.voltmart.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
public class SitemapController {

    private final AppProperties appProperties;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemap() {
        String baseUrl = normalizeBaseUrl(appProperties.getStore().getFrontendUrl());
        StringBuilder xml = new StringBuilder("""
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                """);

        appendUrl(xml, baseUrl + "/", "daily", "1.0");
        appendUrl(xml, baseUrl + "/products", "daily", "0.9");
        appendUrl(xml, baseUrl + "/services", "weekly", "0.8");
        appendUrl(xml, baseUrl + "/bulk-order", "weekly", "0.8");
        appendUrl(xml, baseUrl + "/about", "monthly", "0.5");
        appendUrl(xml, baseUrl + "/contact", "monthly", "0.5");
        appendUrl(xml, baseUrl + "/help-center", "monthly", "0.5");
        appendUrl(xml, baseUrl + "/terms", "yearly", "0.3");
        appendUrl(xml, baseUrl + "/privacy", "yearly", "0.3");

        categoryRepository.findAll().stream()
                .filter(category -> category.getSlug() != null && !category.getSlug().isBlank())
                .forEach(category -> appendUrl(
                        xml,
                        baseUrl + "/products?category=" + category.getSlug(),
                        "weekly",
                        "0.7"
                ));

        productRepository.findAll().stream()
                .filter(product -> product.getSlug() != null && !product.getSlug().isBlank())
                .forEach(product -> appendUrl(
                        xml,
                        baseUrl + "/products/" + product.getSlug(),
                        "weekly",
                        "0.8"
                ));

        xml.append("</urlset>");
        return xml.toString();
    }

    private void appendUrl(StringBuilder xml, String location, String changeFreq, String priority) {
        xml.append("<url>\n")
                .append("  <loc>").append(location).append("</loc>\n")
                .append("  <lastmod>").append(LocalDate.now()).append("</lastmod>\n")
                .append("  <changefreq>").append(changeFreq).append("</changefreq>\n")
                .append("  <priority>").append(priority).append("</priority>\n")
                .append("</url>\n");
    }

    private String normalizeBaseUrl(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
