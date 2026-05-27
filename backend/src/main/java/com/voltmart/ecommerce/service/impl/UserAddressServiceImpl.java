package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.dto.account.UserAddressRequest;
import com.voltmart.ecommerce.dto.account.UserAddressResponse;
import com.voltmart.ecommerce.entity.UserAddress;
import com.voltmart.ecommerce.exception.BadRequestException;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.repository.UserAddressRepository;
import com.voltmart.ecommerce.service.CurrentUserService;
import com.voltmart.ecommerce.service.UserAddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAddressServiceImpl implements UserAddressService {

    private final UserAddressRepository userAddressRepository;
    private final CurrentUserService currentUserService;

    @Override
    public List<UserAddressResponse> getAddressesForCurrentUser() {
        return userAddressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(currentUserService.getCurrentUser().getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public UserAddressResponse createAddress(UserAddressRequest request) {
        var user = currentUserService.getCurrentUser();
        var address = UserAddress.builder()
                .user(user)
                .label(request.label().trim())
                .recipientName(request.recipientName().trim())
                .phone(request.phone().trim())
                .streetAddress(request.streetAddress().trim())
                .city(request.city().trim())
                .postalCode(request.postalCode().trim())
                .defaultAddress(request.defaultAddress())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        syncDefaultFlag(user.getId(), address);
        return toResponse(userAddressRepository.save(address));
    }

    @Override
    @Transactional
    public UserAddressResponse updateAddress(Long id, UserAddressRequest request) {
        var address = userAddressRepository.findByIdAndUserId(id, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        address.setLabel(request.label().trim());
        address.setRecipientName(request.recipientName().trim());
        address.setPhone(request.phone().trim());
        address.setStreetAddress(request.streetAddress().trim());
        address.setCity(request.city().trim());
        address.setPostalCode(request.postalCode().trim());
        address.setDefaultAddress(request.defaultAddress());
        address.setUpdatedAt(LocalDateTime.now());
        syncDefaultFlag(address.getUser().getId(), address);
        return toResponse(userAddressRepository.save(address));
    }

    @Override
    @Transactional
    public void deleteAddress(Long id) {
        var address = userAddressRepository.findByIdAndUserId(id, currentUserService.getCurrentUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        userAddressRepository.delete(address);
        var remaining = userAddressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(address.getUser().getId());
        if (!remaining.isEmpty() && remaining.stream().noneMatch(UserAddress::isDefaultAddress)) {
            var replacement = remaining.getFirst();
            replacement.setDefaultAddress(true);
            replacement.setUpdatedAt(LocalDateTime.now());
            userAddressRepository.save(replacement);
        }
    }

    private void syncDefaultFlag(Long userId, UserAddress selectedAddress) {
        var addresses = userAddressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId);
        if (!selectedAddress.isDefaultAddress() && addresses.isEmpty()) {
            selectedAddress.setDefaultAddress(true);
            return;
        }
        if (!selectedAddress.isDefaultAddress()) {
            return;
        }
        addresses.stream()
                .filter(existing -> existing.getId() != null && !existing.getId().equals(selectedAddress.getId()))
                .forEach(existing -> {
                    existing.setDefaultAddress(false);
                    existing.setUpdatedAt(LocalDateTime.now());
                    userAddressRepository.save(existing);
                });
    }

    private UserAddressResponse toResponse(UserAddress address) {
        return new UserAddressResponse(
                address.getId(),
                address.getLabel(),
                address.getRecipientName(),
                address.getPhone(),
                address.getStreetAddress(),
                address.getCity(),
                address.getPostalCode(),
                address.isDefaultAddress()
        );
    }
}
