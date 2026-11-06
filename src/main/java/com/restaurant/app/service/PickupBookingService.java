
package com.restaurant.app.service;

import com.restaurant.app.dto.PickupBookingRequest;
import com.restaurant.app.dto.PickupBookingResponse;
import com.restaurant.app.dto.PickupBookingDetailsResponse;

import com.restaurant.app.entity.MenuItem;
import com.restaurant.app.entity.PickupBooking;
import com.restaurant.app.entity.PickupBookingItem;

import com.restaurant.app.repository.MenuItemRepository;
import com.restaurant.app.repository.PickupBookingItemRepository;
import com.restaurant.app.repository.PickupBookingRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.time.Year;

@Service
public class PickupBookingService {

    private final PickupBookingRepository bookingRepository;
    private final PickupBookingItemRepository bookingItemRepository;
    private final MenuItemRepository menuItemRepository;

    public PickupBookingService(
            PickupBookingRepository bookingRepository,
            PickupBookingItemRepository bookingItemRepository,
            MenuItemRepository menuItemRepository) {

        this.bookingRepository = bookingRepository;
        this.bookingItemRepository = bookingItemRepository;
        this.menuItemRepository = menuItemRepository;
    }

    // CREATE A COLLECTION BOOKING
    @Transactional
    public PickupBookingResponse createBooking(
            PickupBookingRequest request) {

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException(
                    "Your booking must contain at least one item.");
        }

        PickupBooking booking = new PickupBooking();

        booking.setCustomerName(request.getCustomerName().trim());
        booking.setPhone(request.getPhone().trim());
        booking.setEmail(request.getEmail());
        booking.setNotes(request.getNotes());
        booking.setStatus("BOOKED");

        String bookingNumber;

        do {
            String reference = UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();

            bookingNumber = "BK-" + Year.now().getValue()
                    + "-" + reference;

        } while (bookingRepository.existsByBookingNumber(bookingNumber));

        booking.setBookingNumber(bookingNumber);

        PickupBooking savedBooking =
                bookingRepository.save(booking);

        for (PickupBookingRequest.BookingItemRequest requestedItem
                : request.getItems()) {

            if (requestedItem.getMenuItemId() == null
                    || requestedItem.getQuantity() == null) {

                throw new IllegalArgumentException(
                        "Each booking item needs a menu ID and quantity.");
            }

            if (requestedItem.getQuantity() < 1
                    || requestedItem.getQuantity() > 50) {

                throw new IllegalArgumentException(
                        "Each item quantity must be between 1 and 50.");
            }

            MenuItem menuItem = menuItemRepository
                    .findById(requestedItem.getMenuItemId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "A selected menu item could not be found."));

            if (!menuItem.isAvailable()) {
                throw new IllegalArgumentException(
                        menuItem.getName() + " is currently unavailable.");
            }

            PickupBookingItem bookingItem =
                    new PickupBookingItem();

            bookingItem.setBooking(savedBooking);
            bookingItem.setMenuItemId(menuItem.getId());
            bookingItem.setItemName(menuItem.getName());
            bookingItem.setQuantity(requestedItem.getQuantity());
            bookingItem.setUnitPrice(menuItem.getPrice());

            bookingItemRepository.save(bookingItem);
        }

        return new PickupBookingResponse(
                savedBooking.getBookingNumber(),
                savedBooking.getStatus(),
                savedBooking.getCustomerName(),
                savedBooking.getCreatedAt(),
                "Your collection booking has been received. "
                + "We will only start preparing your food when you arrive "
                + "and present your unique Booking Number. Please keep "
                + "this number safe."
        );
    }

    // RETRIEVE ONE COLLECTION BOOKING
    @Transactional(readOnly = true)
    public PickupBookingDetailsResponse getBookingDetails(
            String bookingNumber) {

        PickupBooking booking = bookingRepository
                .findByBookingNumber(bookingNumber)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Booking not found. Please check your Booking Number."));

        return convertToDetailsResponse(booking);
    }

    // RETRIEVE ALL COLLECTION BOOKINGS FOR ADMIN
    @Transactional(readOnly = true)
    public List<PickupBookingDetailsResponse> getAllBookings() {

        List<PickupBooking> bookings = bookingRepository.findAll();

        List<PickupBookingDetailsResponse> responses =
                new ArrayList<>();

        for (PickupBooking booking : bookings) {
            responses.add(convertToDetailsResponse(booking));
        }

        return responses;
    }

    // UPDATE BOOKING STATUS
    @Transactional
    public PickupBookingDetailsResponse updateBookingStatus(
            String bookingNumber,
            String newStatus) {

        PickupBooking booking = bookingRepository
                .findByBookingNumber(bookingNumber)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Booking not found."));

        String currentStatus = booking.getStatus();

        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "A booking status must be provided.");
        }

        newStatus = newStatus.trim().toUpperCase();

        boolean validTransition = false;

        switch (currentStatus) {

            case "BOOKED":
                validTransition =
                        newStatus.equals("ARRIVED")
                        || newStatus.equals("CANCELLED");
                break;

            case "ARRIVED":
                validTransition =
                        newStatus.equals("PREPARING")
                        || newStatus.equals("CANCELLED");
                break;

            case "PREPARING":
                validTransition =
                        newStatus.equals("READY")
                        || newStatus.equals("CANCELLED");
                break;

            case "READY":
                validTransition = newStatus.equals("COLLECTED");
                break;

            default:
                validTransition = false;
                break;
        }

        if (!validTransition) {
            throw new IllegalArgumentException(
                    "Invalid booking status transition: "
                    + currentStatus + " to " + newStatus);
        }

        booking.setStatus(newStatus);

        PickupBooking updatedBooking =
                bookingRepository.save(booking);

        return convertToDetailsResponse(updatedBooking);
    }

    // CONVERT BOOKING ENTITY INTO RESPONSE DTO
    private PickupBookingDetailsResponse convertToDetailsResponse(
            PickupBooking booking) {

        List<PickupBookingItem> bookingItems =
                bookingItemRepository.findByBookingId(booking.getId());

        List<PickupBookingDetailsResponse.BookingItemDetails> items =
                new ArrayList<>();

        for (PickupBookingItem item : bookingItems) {

            items.add(
                    new PickupBookingDetailsResponse.BookingItemDetails(
                            item.getItemName(),
                            item.getQuantity(),
                            item.getUnitPrice()
                    )
            );
        }

        return new PickupBookingDetailsResponse(
                booking.getBookingNumber(),
                booking.getStatus(),
                booking.getCustomerName(),
                booking.getPhone(),
                booking.getEmail(),
                booking.getCreatedAt(),
                items
        );
    }
}
