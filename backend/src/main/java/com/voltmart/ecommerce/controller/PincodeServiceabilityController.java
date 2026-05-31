package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.pincode.PincodeServiceabilityResponse;
import com.voltmart.ecommerce.service.ServiceablePincodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pincode-serviceability")
@RequiredArgsConstructor
public class PincodeServiceabilityController {

    private final ServiceablePincodeService serviceablePincodeService;

    @GetMapping
    public PincodeServiceabilityResponse check(@RequestParam String pincode) {
        return serviceablePincodeService.checkServiceability(pincode);
    }
}
