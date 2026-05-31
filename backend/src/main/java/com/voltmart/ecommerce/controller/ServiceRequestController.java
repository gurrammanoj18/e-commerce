package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.service.ServiceRequestCreateRequest;
import com.voltmart.ecommerce.dto.service.ServiceRequestResponse;
import com.voltmart.ecommerce.service.ServiceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    @PostMapping("/requests")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceRequestResponse createRequest(@Valid @RequestBody ServiceRequestCreateRequest request) {
        return serviceRequestService.createRequest(request);
    }
}
