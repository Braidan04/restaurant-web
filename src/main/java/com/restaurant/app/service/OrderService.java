
package com.restaurant.app.service;

import com.restaurant.app.dto.OrderRequest;
import com.restaurant.app.dto.OrderRequest.OrderItemRequest;
import com.restaurant.app.entity.Customer;
import com.restaurant.app.entity.MenuItem;
import com.restaurant.app.entity.OrderItem;
import com.restaurant.app.entity.RestaurantOrder;
import com.restaurant.app.repository.CustomerRepository;
import com.restaurant.app.repository.MenuItemRepository;
import com.restaurant.app.repository.OrderItemRepository;
import com.restaurant.app.repository.OrderRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final CustomerRepository customerRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    private static final BigDecimal RESERVATION_DEPOSIT =
            new BigDecimal("7.00");

    private static final BigDecimal DELIVERY_FEE =
            new BigDecimal("0.00");

    public OrderService(
            CustomerRepository customerRepository,
            MenuItemRepository menuItemRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository) {

        this.customerRepository = customerRepository;
        this.menuItemRepository = menuItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional
    public RestaurantOrder createOrder(OrderRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("Order details are required.");
        }

        String fullName = request.getCustomerName();
        String phone = request.getPhone();
        String orderType = request.getOrderType();
        String paymentMethod = request.getPaymentMethod();
        List<OrderItemRequest> requestedItems = request.getItems();

        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException("Customer name is required.");
        }

        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("Phone number is required.");
        }

        if (!"DELIVERY".equals(orderType)
                && !"COLLECTION".equals(orderType)) {
            throw new IllegalArgumentException("Invalid order type.");
        }

        if ("DELIVERY".equals(orderType)
                && (request.getDeliveryAddress() == null
                || request.getDeliveryAddress().isBlank())) {
            throw new IllegalArgumentException("Delivery address is required.");
        }

        if ("DELIVERY".equals(orderType)
                && !"ONLINE".equals(paymentMethod)) {
            throw new IllegalArgumentException(
                    "Delivery orders require online payment.");
        }

        if ("COLLECTION".equals(orderType)
                && !"ONLINE".equals(paymentMethod)
                && !"PAY_ON_COLLECTION".equals(paymentMethod)) {
            throw new IllegalArgumentException("Invalid payment method.");
        }

        if (requestedItems == null || requestedItems.isEmpty()) {
            throw new IllegalArgumentException("Your cart is empty.");
        }

        Customer customer = new Customer(
                fullName.trim(),
                phone.trim(),
                request.getEmail()
        );

        customer = customerRepository.save(customer);

        BigDecimal subtotal = BigDecimal.ZERO;

        RestaurantOrder order = new RestaurantOrder();
        order.setCustomer(customer);
        order.setOrderType(orderType);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setPaymentMethod(paymentMethod);
        order.setNotes(request.getNotes());

        order = orderRepository.save(order);

        for (OrderItemRequest requestedItem : requestedItems) {

            if (requestedItem == null
                    || requestedItem.getMenuItemId() == null) {
                throw new IllegalArgumentException("Invalid menu item.");
            }

            Integer quantity = requestedItem.getQuantity();

            if (quantity == null || quantity < 1 || quantity > 50) {
                throw new IllegalArgumentException(
                        "Invalid product quantity.");
            }

            MenuItem menuItem = menuItemRepository
                    .findById(requestedItem.getMenuItemId())
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Menu product not found."));

            if (!menuItem.isAvailable()) {
                throw new IllegalArgumentException(
                        menuItem.getName() + " is currently unavailable.");
            }

            BigDecimal unitPrice = menuItem.getPrice();

            BigDecimal lineTotal = unitPrice.multiply(
                    BigDecimal.valueOf(quantity)
            );

            subtotal = subtotal.add(lineTotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItemId(menuItem.getId());
            orderItem.setItemName(menuItem.getName());
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(unitPrice);
            orderItem.setLineTotal(lineTotal);

            orderItemRepository.save(orderItem);
        }

        BigDecimal deliveryFee = "DELIVERY".equals(orderType)
                ? DELIVERY_FEE
                : BigDecimal.ZERO;

        BigDecimal total = subtotal.add(deliveryFee);

        BigDecimal reservationDeposit = BigDecimal.ZERO;

        if ("PAY_ON_COLLECTION".equals(paymentMethod)) {
            reservationDeposit = RESERVATION_DEPOSIT.min(total);
        }

        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTotal(total);
        order.setReservationDeposit(reservationDeposit);
        order.setStatus("PENDING_PAYMENT");

        return orderRepository.save(order);
    }
}
