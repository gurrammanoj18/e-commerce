package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.HomepageSectionContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HomepageSectionContentRepository extends JpaRepository<HomepageSectionContent, Long> {

    Optional<HomepageSectionContent> findBySectionKey(String sectionKey);
}
