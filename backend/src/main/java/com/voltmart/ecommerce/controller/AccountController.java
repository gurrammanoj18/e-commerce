package com.voltmart.ecommerce.controller;

import com.voltmart.ecommerce.dto.account.UserAddressRequest;
import com.voltmart.ecommerce.dto.account.UserAddressResponse;
import com.voltmart.ecommerce.service.UserAddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final UserAddressService userAddressService;

    @GetMapping("/addresses")
    public List<UserAddressResponse> getAddresses() {
        return userAddressService.getAddressesForCurrentUser();
    }

    @PostMapping("/addresses")
    @ResponseStatus(HttpStatus.CREATED)
    public UserAddressResponse createAddress(@Valid @RequestBody UserAddressRequest request) {
        return userAddressService.createAddress(request);
    }

    @PutMapping("/addresses/{id}")
    public UserAddressResponse updateAddress(@PathVariable Long id, @Valid @RequestBody UserAddressRequest request) {
        return userAddressService.updateAddress(id, request);
    }

    @DeleteMapping("/addresses/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAddress(@PathVariable Long id) {
        userAddressService.deleteAddress(id);
    }
}
