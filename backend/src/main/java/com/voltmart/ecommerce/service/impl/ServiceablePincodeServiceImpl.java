package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.pincode.PincodeServiceabilityResponse;
import com.voltmart.ecommerce.dto.pincode.ServiceablePincodeRequest;
import com.voltmart.ecommerce.dto.pincode.ServiceablePincodeResponse;
import com.voltmart.ecommerce.entity.ServiceablePincode;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.repository.ServiceablePincodeRepository;
import com.voltmart.ecommerce.service.ServiceablePincodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceablePincodeServiceImpl implements ServiceablePincodeService {

    private final ServiceablePincodeRepository serviceablePincodeRepository;

    @Override
    public PincodeServiceabilityResponse checkServiceability(String pincode) {
        String normalized = normalizePincode(pincode);
        boolean serviceable = serviceablePincodeRepository.existsByPincodeAndActiveTrue(normalized);
        return new PincodeServiceabilityResponse(
                normalized,
                serviceable,
                serviceable
                        ? "Home delivery is available within the shop's 5 km radius. Shipping and tax are waived."
                        : "Home delivery is not available for this pincode yet."
        );
    }

    @Override
    public boolean isServiceable(String pincode) {
        return serviceablePincodeRepository.existsByPincodeAndActiveTrue(normalizePincode(pincode));
    }

    @Override
    public void validateHomeDeliveryPincode(String pincode) {
        String normalized = normalizePincode(pincode);
        if (!serviceablePincodeRepository.existsByPincodeAndActiveTrue(normalized)) {
            throw new BadRequestException("Home delivery is not available for pincode " + normalized);
        }
    }

    @Override
    public List<ServiceablePincodeResponse> getAllPincodes() {
        return serviceablePincodeRepository.findAllByOrderByPincodeAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ServiceablePincodeResponse createPincode(ServiceablePincodeRequest request) {
        String normalized = normalizePincode(request.pincode());
        serviceablePincodeRepository.findByPincode(normalized).ifPresent(existing -> {
            throw new BadRequestException("This pincode already exists");
        });

        ServiceablePincode pincode = ServiceablePincode.builder()
                .pincode(normalized)
                .label(trimOrNull(request.label()))
                .active(request.active() == null || request.active())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return toResponse(serviceablePincodeRepository.save(pincode));
    }

    @Override
    @Transactional
    public ServiceablePincodeResponse updatePincode(Long id, ServiceablePincodeRequest request) {
        ServiceablePincode pincode = serviceablePincodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviceable pincode not found"));

        String normalized = normalizePincode(request.pincode());
        serviceablePincodeRepository.findByPincode(normalized)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BadRequestException("This pincode already exists");
                });

        pincode.setPincode(normalized);
        pincode.setLabel(trimOrNull(request.label()));
        pincode.setActive(request.active() == null || request.active());
        pincode.setUpdatedAt(LocalDateTime.now());
        return toResponse(serviceablePincodeRepository.save(pincode));
    }

    @Override
    @Transactional
    public void deletePincode(Long id) {
        ServiceablePincode pincode = serviceablePincodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviceable pincode not found"));
        serviceablePincodeRepository.delete(pincode);
    }

    private ServiceablePincodeResponse toResponse(ServiceablePincode pincode) {
        return new ServiceablePincodeResponse(
                pincode.getId(),
                pincode.getPincode(),
                pincode.getLabel(),
                pincode.isActive()
        );
    }

    private String normalizePincode(String value) {
        if (!StringUtils.hasText(value)) {
            throw new BadRequestException("Pincode is required");
        }
        String normalized = value.trim().replaceAll("\\s+", "");
        if (!normalized.matches("\\d{6}")) {
            throw new BadRequestException("Enter a valid 6-digit pincode");
        }
        return normalized;
    }

    private String trimOrNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
