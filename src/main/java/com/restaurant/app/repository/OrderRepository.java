package com.restaurant.app.repository;

import com.restaurant.app.entity.RestaurantOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<RestaurantOrder, Long> {

}