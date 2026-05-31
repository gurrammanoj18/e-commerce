package com.voltmart.ecommerce.dto.service;

import java.time.LocalDateTime;
import java.util.List;

public record ServiceRequestResponse(
        Long id,
        Long userId,
        String userName,
        String serviceKey,
        String serviceName,
        String customerName,
        String phoneNumber,
        String address,
        String postalCode,
        String description,
        List<String> problemImages,
        LocalDateTime createdAt
) {
}
