package com.voltmart.ecommerce.service;

import com.voltmart.ecommerce.dto.product.InventoryResponse;
import com.voltmart.ecommerce.dto.user.AdminUserResponse;

import java.util.List;
import java.util.Map;

public interface AdminService {
    Map<String, Object> getDashboardOverview();
    List<AdminUserResponse> getUsers();
    List<InventoryResponse> getInventory();
}
