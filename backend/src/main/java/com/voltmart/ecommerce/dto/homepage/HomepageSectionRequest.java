package com.voltmart.ecommerce.dto.homepage;

import com.voltmart.ecommerce.entity.enums.HomepageSectionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record HomepageSectionRequest(
        @NotBlank String sectionKey,
        @NotBlank String eyebrow,
        @NotBlank String title,
        @NotNull HomepageSectionType type,
        String keywords,
        @NotNull Integer displayOrder,
        @NotNull Integer maxProducts,
        @NotNull Boolean active
) {
}
