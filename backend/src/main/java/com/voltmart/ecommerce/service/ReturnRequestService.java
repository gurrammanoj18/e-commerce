package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.returnrequest.ReturnRequestCreateRequest;
import com.voltmart.ecommerce.dto.returnrequest.ReturnRequestResponse;
import com.voltmart.ecommerce.dto.returnrequest.ReturnRequestUpdateRequest;

import java.util.List;

public interface ReturnRequestService {
    ReturnRequestResponse createReturnRequest(ReturnRequestCreateRequest request);
    List<ReturnRequestResponse> getCurrentUserReturnRequests();
    List<ReturnRequestResponse> getAllReturnRequests();
    ReturnRequestResponse updateReturnRequest(Long id, ReturnRequestUpdateRequest request);
}
