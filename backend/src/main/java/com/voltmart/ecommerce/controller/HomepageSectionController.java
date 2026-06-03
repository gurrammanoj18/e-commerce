package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.homepage.HomepageSectionResponse;
import com.voltmart.ecommerce.service.HomepageSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/homepage-sections")
@RequiredArgsConstructor
public class HomepageSectionController {

    private final HomepageSectionService homepageSectionService;

    @GetMapping
    public List<HomepageSectionResponse> getSections() {
        return homepageSectionService.getActiveSections();
    }
}
