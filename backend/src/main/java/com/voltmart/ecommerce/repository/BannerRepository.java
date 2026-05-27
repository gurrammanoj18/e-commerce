package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findAllByOrderByDisplayOrderAscCreatedAtDesc();
    List<Banner> findByActiveTrueOrderByDisplayOrderAscCreatedAtDesc();
}
