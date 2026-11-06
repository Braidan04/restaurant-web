
package com.restaurant.app.controller;

import com.restaurant.app.dto.PickupBookingRequest;
import com.restaurant.app.dto.PickupBookingResponse;
import com.restaurant.app.dto.PickupBookingDetailsResponse;
import com.restaurant.app.service.PickupBookingService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class PickupBookingController {

    private final PickupBookingService bookingService;

    public PickupBookingController(
            PickupBookingService bookingService) {
        this.bookingService = bookingService;
    }

    // CREATE A COLLECTION BOOKING
    @PostMapping
    public ResponseEntity<PickupBookingResponse> createBooking(
            @Valid @RequestBody PickupBookingRequest request) {

        PickupBookingResponse response =
                bookingService.createBooking(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // RETRIEVE ONE BOOKING
    @GetMapping("/{bookingNumber}")
    public ResponseEntity<PickupBookingDetailsResponse> getBookingDetails(
            @PathVariable String bookingNumber) {

        PickupBookingDetailsResponse response =
                bookingService.getBookingDetails(bookingNumber);

        return ResponseEntity.ok(response);
    }

    // RETRIEVE ALL BOOKINGS FOR ADMIN
    @GetMapping
    public ResponseEntity<List<PickupBookingDetailsResponse>> getAllBookings() {

        List<PickupBookingDetailsResponse> bookings =
                bookingService.getAllBookings();

        return ResponseEntity.ok(bookings);
    }

    // UPDATE BOOKING STATUS
    @PatchMapping("/{bookingNumber}/status")
    public ResponseEntity<PickupBookingDetailsResponse> updateBookingStatus(
            @PathVariable String bookingNumber,
            @RequestBody Map<String, String> request) {

        String status = request.get("status");

        PickupBookingDetailsResponse response =
                bookingService.updateBookingStatus(
                        bookingNumber, status);

        return ResponseEntity.ok(response);
    }
}
