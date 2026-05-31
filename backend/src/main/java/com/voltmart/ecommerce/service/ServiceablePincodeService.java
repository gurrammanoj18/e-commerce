package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.pincode.PincodeServiceabilityResponse;
import com.voltmart.ecommerce.dto.pincode.ServiceablePincodeRequest;
import com.voltmart.ecommerce.dto.pincode.ServiceablePincodeResponse;

import java.util.List;

public interface ServiceablePincodeService {
    PincodeServiceabilityResponse checkServiceability(String pincode);
    boolean isServiceable(String pincode);
    void validateHomeDeliveryPincode(String pincode);
    List<ServiceablePincodeResponse> getAllPincodes();
    ServiceablePincodeResponse createPincode(ServiceablePincodeRequest request);
    ServiceablePincodeResponse updatePincode(Long id, ServiceablePincodeRequest request);
    void deletePincode(Long id);
}
