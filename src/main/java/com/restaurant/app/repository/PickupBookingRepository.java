package com.restaurant.app.repository;

import com.restaurant.app.entity.PickupBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PickupBookingRepository
        extends JpaRepository<PickupBooking, Long> {

    Optional<PickupBooking> findByBookingNumber(String bookingNumber);

    boolean existsByBookingNumber(String bookingNumber);
}