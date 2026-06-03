package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.HomepageSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HomepageSectionRepository extends JpaRepository<HomepageSection, Long> {

    List<HomepageSection> findAllByOrderByDisplayOrderAscIdAsc();

    List<HomepageSection> findByActiveTrueOrderByDisplayOrderAscIdAsc();

    Optional<HomepageSection> findBySectionKey(String sectionKey);
}
