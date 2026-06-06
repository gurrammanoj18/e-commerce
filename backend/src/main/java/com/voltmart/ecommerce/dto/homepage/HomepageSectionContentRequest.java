package com.voltmart.ecommerce.dto.homepage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record HomepageSectionContentRequest(
        @NotBlank @Size(max = 120) String tagline,
        @NotBlank @Size(max = 120) String heading
) {
}
