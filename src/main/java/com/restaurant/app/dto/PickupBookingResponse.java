package com.restaurant.app.dto;

import java.time.LocalDateTime;

public class PickupBookingResponse {

    private String bookingNumber;
    private String status;
    private String customerName;
    private LocalDateTime createdAt;
    private String message;

    public PickupBookingResponse() {
    }

    public PickupBookingResponse(
            String bookingNumber,
            String status,
            String customerName,
            LocalDateTime createdAt,
            String message) {

        this.bookingNumber = bookingNumber;
        this.status = status;
        this.customerName = customerName;
        this.createdAt = createdAt;
        this.message = message;
    }

    public String getBookingNumber() {
        return bookingNumber;
    }

    public void setBookingNumber(String bookingNumber) {
        this.bookingNumber = bookingNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}