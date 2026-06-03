package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.BrandLogo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BrandLogoRepository extends JpaRepository<BrandLogo, Long> {

    List<BrandLogo> findAllByOrderByDisplayOrderAscIdAsc();

    List<BrandLogo> findByActiveTrueOrderByDisplayOrderAscIdAsc();

    Optional<BrandLogo> findByBrandNameIgnoreCase(String brandName);
}
