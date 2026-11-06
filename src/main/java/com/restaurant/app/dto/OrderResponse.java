
package com.restaurant.app.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderResponse {

    private Long orderId;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal total;
    private BigDecimal reservationDeposit;
    private BigDecimal amountDueNow;
    private BigDecimal balanceAtCollection;
    private LocalDateTime createdAt;
    private String message;

    public OrderResponse() {}

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDeliveryFee() {
        return deliveryFee;
    }

    public void setDeliveryFee(BigDecimal deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public BigDecimal getReservationDeposit() {
        return reservationDeposit;
    }

    public void setReservationDeposit(BigDecimal reservationDeposit) {
        this.reservationDeposit = reservationDeposit;
    }

    public BigDecimal getAmountDueNow() {
        return amountDueNow;
    }

    public void setAmountDueNow(BigDecimal amountDueNow) {
        this.amountDueNow = amountDueNow;
    }

    public BigDecimal getBalanceAtCollection() {
        return balanceAtCollection;
    }

    public void setBalanceAtCollection(BigDecimal balanceAtCollection) {
        this.balanceAtCollection = balanceAtCollection;
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
