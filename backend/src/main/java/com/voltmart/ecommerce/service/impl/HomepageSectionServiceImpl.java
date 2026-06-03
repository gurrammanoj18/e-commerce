package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.homepage.HomepageSectionRequest;
import com.voltmart.ecommerce.dto.homepage.HomepageSectionResponse;
import com.voltmart.ecommerce.entity.HomepageSection;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.repository.HomepageSectionRepository;
import com.voltmart.ecommerce.service.HomepageSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HomepageSectionServiceImpl implements HomepageSectionService {

    private final HomepageSectionRepository homepageSectionRepository;

    @Override
    public List<HomepageSectionResponse> getActiveSections() {
        return homepageSectionRepository.findByActiveTrueOrderByDisplayOrderAscIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<HomepageSectionResponse> getAdminSections() {
        return homepageSectionRepository.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public HomepageSectionResponse createSection(HomepageSectionRequest request) {
        return toResponse(homepageSectionRepository.save(applyRequest(new HomepageSection(), request)));
    }

    @Override
    @Transactional
    public HomepageSectionResponse updateSection(Long id, HomepageSectionRequest request) {
        HomepageSection section = homepageSectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Homepage section not found"));
        return toResponse(homepageSectionRepository.save(applyRequest(section, request)));
    }

    @Override
    @Transactional
    public void deleteSection(Long id) {
        HomepageSection section = homepageSectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Homepage section not found"));
        homepageSectionRepository.delete(section);
    }

    private HomepageSection applyRequest(HomepageSection section, HomepageSectionRequest request) {
        section.setSectionKey(trim(request.sectionKey()));
        section.setEyebrow(trim(request.eyebrow()));
        section.setTitle(trim(request.title()));
        section.setType(request.type());
        section.setKeywords(trimOrNull(request.keywords()));
        section.setDisplayOrder(request.displayOrder());
        section.setMaxProducts(Math.max(1, request.maxProducts()));
        section.setActive(request.active());
        return section;
    }

    private HomepageSectionResponse toResponse(HomepageSection section) {
        return new HomepageSectionResponse(
                section.getId(),
                section.getSectionKey(),
                section.getEyebrow(),
                section.getTitle(),
                section.getType(),
                section.getKeywords(),
                section.getDisplayOrder(),
                section.getMaxProducts(),
                section.getActive()
        );
    }

    private String trim(String value) {
        return value == null ? "" : value.trim();
    }

    private String trimOrNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
