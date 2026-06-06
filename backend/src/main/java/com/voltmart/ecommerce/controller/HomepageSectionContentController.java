package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.homepage.HomepageSectionContentResponse;
import com.voltmart.ecommerce.service.HomepageSectionContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/homepage-sections")
@RequiredArgsConstructor
public class HomepageSectionContentController {

    private final HomepageSectionContentService homepageSectionContentService;

    @GetMapping
    public List<HomepageSectionContentResponse> getSections() {
        return homepageSectionContentService.getSections();
    }
}
