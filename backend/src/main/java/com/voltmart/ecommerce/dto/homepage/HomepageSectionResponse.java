package com.voltmart.ecommerce.dto.homepage;

import com.voltmart.ecommerce.entity.enums.HomepageSectionType;

public record HomepageSectionResponse(
        Long id,
        String sectionKey,
        String eyebrow,
        String title,
        HomepageSectionType type,
        String keywords,
        Integer displayOrder,
        Integer maxProducts,
        Boolean active
) {
}
