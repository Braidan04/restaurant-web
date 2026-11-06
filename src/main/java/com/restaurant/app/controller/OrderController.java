
package com.restaurant.app.controller;

import com.restaurant.app.dto.OrderRequest;
import com.restaurant.app.dto.OrderResponse;
import com.restaurant.app.entity.RestaurantOrder;
import com.restaurant.app.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestBody OrderRequest request) {

        RestaurantOrder order = orderService.createOrder(request);

        OrderResponse response = new OrderResponse();

        response.setOrderId(order.getId());
        response.setStatus(order.getStatus());
        response.setSubtotal(order.getSubtotal());
        response.setDeliveryFee(order.getDeliveryFee());
        response.setTotal(order.getTotal());
        response.setReservationDeposit(order.getReservationDeposit());
        response.setCreatedAt(order.getCreatedAt());

        BigDecimal amountDueNow;
        BigDecimal balanceAtCollection;

        if ("PAY_ON_COLLECTION".equals(order.getPaymentMethod())) {
            amountDueNow = order.getReservationDeposit();
            balanceAtCollection = order.getTotal().subtract(amountDueNow);
        } else {
            amountDueNow = order.getTotal();
            balanceAtCollection = BigDecimal.ZERO;
        }

        response.setAmountDueNow(amountDueNow);
        response.setBalanceAtCollection(balanceAtCollection);

        response.setMessage(
                "Your order has been created and is awaiting payment."
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
