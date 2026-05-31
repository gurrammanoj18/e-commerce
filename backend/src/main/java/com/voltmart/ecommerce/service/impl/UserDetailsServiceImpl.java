package com.voltmart.ecommerce.service.impl;

import com.voltmart.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalizedUsername = username == null ? "" : username.trim();
        return userRepository.findByEmailIgnoreCaseOrPhoneNumber(normalizedUsername, normalizedUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
