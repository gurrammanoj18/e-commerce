package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    List<UserAddress> findByUserIdOrderByDefaultAddressDescCreatedAtDesc(Long userId);
    Optional<UserAddress> findByIdAndUserId(Long id, Long userId);
}
