package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.service.ServiceRequestCreateRequest;
import com.voltmart.ecommerce.dto.service.ServiceRequestResponse;

import java.util.List;

public interface ServiceRequestService {
    ServiceRequestResponse createRequest(ServiceRequestCreateRequest request);
    List<ServiceRequestResponse> getAllRequests();
}
