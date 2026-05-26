package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.entity.User;
import com.voltmart.ecommerce.exception.ResourceNotFoundException;
import com.voltmart.ecommerce.repository.UserRepository;
import com.voltmart.ecommerce.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserServiceImpl implements CurrentUserService {

    private final UserRepository userRepository;

    @Override
    public User getCurrentUser() {
        String loginIdentifier = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailOrPhoneNumber(loginIdentifier, loginIdentifier)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
