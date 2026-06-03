package com.voltmart.ecommerce.repository;

import com.voltmart.ecommerce.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    void deleteByProductIdIn(Collection<Long> productIds);

    @Query(value = """
            select oi.product_id
            from order_item oi
            join orders o on o.id = oi.order_id
            where o.status = 'DELIVERED'
            group by oi.product_id
            order by sum(oi.quantity) desc, max(o.created_at) desc
            """, nativeQuery = true)
    List<Long> findTopDeliveredProductIds();
}
