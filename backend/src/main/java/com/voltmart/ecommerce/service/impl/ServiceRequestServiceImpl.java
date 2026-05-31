package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.service.ServiceRequestCreateRequest;
import com.voltmart.ecommerce.dto.service.ServiceRequestResponse;
import com.voltmart.ecommerce.entity.ServiceRequest;
import com.voltmart.ecommerce.service.CurrentUserService;
import com.voltmart.ecommerce.service.ServiceRequestService;
import com.voltmart.ecommerce.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceRequestServiceImpl implements ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public ServiceRequestResponse createRequest(ServiceRequestCreateRequest request) {
        var user = currentUserService.getCurrentUser();
        ServiceRequest serviceRequest = serviceRequestRepository.save(ServiceRequest.builder()
                .user(user)
                .serviceKey(request.serviceKey().trim())
                .serviceName(request.serviceName().trim())
                .customerName(request.customerName().trim())
                .phoneNumber(request.phoneNumber().trim())
                .address(request.address().trim())
                .postalCode(request.postalCode().trim())
                .description(request.description().trim())
                .problemImages(joinImages(request.problemImages()))
                .createdAt(LocalDateTime.now())
                .build());
        return toResponse(serviceRequest);
    }

    @Override
    public List<ServiceRequestResponse> getAllRequests() {
        return serviceRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    private ServiceRequestResponse toResponse(ServiceRequest request) {
        return new ServiceRequestResponse(
                request.getId(),
                request.getUser() == null ? null : request.getUser().getId(),
                request.getUser() == null ? null : request.getUser().getFullName(),
                request.getServiceKey(),
                request.getServiceName(),
                request.getCustomerName(),
                request.getPhoneNumber(),
                request.getAddress(),
                request.getPostalCode(),
                request.getDescription(),
                splitImages(request.getProblemImages()),
                request.getCreatedAt()
        );
    }

    private String joinImages(List<String> images) {
        if (images == null || images.isEmpty()) {
            return null;
        }
        return images.stream()
                .filter(image -> image != null && !image.isBlank())
                .map(String::trim)
                .reduce((left, right) -> left + "\n" + right)
                .orElse(null);
    }

    private List<String> splitImages(String images) {
        if (images == null || images.isBlank()) {
            return List.of();
        }
        return Arrays.stream(images.split("\\R"))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toList();
    }
}
