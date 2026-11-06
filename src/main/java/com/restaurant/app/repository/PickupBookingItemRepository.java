package com.restaurant.app.repository;

import com.restaurant.app.entity.PickupBookingItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PickupBookingItemRepository
        extends JpaRepository<PickupBookingItem, Long> {

    List<PickupBookingItem> findByBookingId(Long bookingId);
}