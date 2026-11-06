package com.restaurant.app.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PickupBookingDetailsResponse {

    private String bookingNumber;
    private String status;
    private String customerName;
    private String phone;
    private String email;
    private LocalDateTime createdAt;
    private List<BookingItemDetails> items;

    public PickupBookingDetailsResponse(
            String bookingNumber,
            String status,
            String customerName,
            String phone,
            String email,
            LocalDateTime createdAt,
            List<BookingItemDetails> items) {

        this.bookingNumber = bookingNumber;
        this.status = status;
        this.customerName = customerName;
        this.phone = phone;
        this.email = email;
        this.createdAt = createdAt;
        this.items = items;
    }

    public String getBookingNumber() {
        return bookingNumber;
    }

    public String getStatus() {
        return status;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<BookingItemDetails> getItems() {
        return items;
    }

    public static class BookingItemDetails {

        private String itemName;
        private Integer quantity;
        private BigDecimal unitPrice;

        public BookingItemDetails(
                String itemName,
                Integer quantity,
                BigDecimal unitPrice) {

            this.itemName = itemName;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
        }

        public String getItemName() {
            return itemName;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public BigDecimal getUnitPrice() {
            return unitPrice;
        }
    }
}