package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.homepage.HomepageSectionContentRequest;
import com.voltmart.ecommerce.dto.homepage.HomepageSectionContentResponse;

import java.util.List;

public interface HomepageSectionContentService {

    List<HomepageSectionContentResponse> getSections();

    HomepageSectionContentResponse updateSection(String sectionKey, HomepageSectionContentRequest request);
}
