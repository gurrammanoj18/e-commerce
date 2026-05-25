package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);
    List<Product> findByCategorySlugIn(Collection<String> categorySlugs);

    @Query("""
            select p from Product p
            left join p.category category
            left join category.parent parentCategory
            where (
                :categorySlug is null
                or category.slug = :categorySlug
                or parentCategory.slug = :categorySlug
            )
            and (
                :search is null
                or lower(p.name) like lower(concat('%', :search, '%'))
                or lower(p.brand) like lower(concat('%', :search, '%'))
                or lower(category.name) like lower(concat('%', :search, '%'))
                or lower(parentCategory.name) like lower(concat('%', :search, '%'))
            )
            """)
    Page<Product> search(String categorySlug, String search, Pageable pageable);
}
