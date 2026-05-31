package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.returnrequest.ReturnRequestCreateRequest;
import com.voltmart.ecommerce.dto.returnrequest.ReturnRequestResponse;
import com.voltmart.ecommerce.service.ReturnRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/returns", "/api/return-requests"})
@RequiredArgsConstructor
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;

    @PostMapping("/requests")
    @ResponseStatus(HttpStatus.CREATED)
    public ReturnRequestResponse createReturnRequest(@Valid @RequestBody ReturnRequestCreateRequest request) {
        return returnRequestService.createReturnRequest(request);
    }

    @GetMapping("/requests")
    public List<ReturnRequestResponse> getCurrentUserRequests() {
        return returnRequestService.getCurrentUserReturnRequests();
    }
}
