package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.homepage.HomepageSectionRequest;
import com.voltmart.ecommerce.dto.homepage.HomepageSectionResponse;

import java.util.List;

public interface HomepageSectionService {

    List<HomepageSectionResponse> getActiveSections();

    List<HomepageSectionResponse> getAdminSections();

    HomepageSectionResponse createSection(HomepageSectionRequest request);

    HomepageSectionResponse updateSection(Long id, HomepageSectionRequest request);

    void deleteSection(Long id);
}
