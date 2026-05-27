package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.account.UserAddressRequest;
import com.voltmart.ecommerce.dto.account.UserAddressResponse;

import java.util.List;

public interface UserAddressService {
    List<UserAddressResponse> getAddressesForCurrentUser();
    UserAddressResponse createAddress(UserAddressRequest request);
    UserAddressResponse updateAddress(Long id, UserAddressRequest request);
    void deleteAddress(Long id);
}
