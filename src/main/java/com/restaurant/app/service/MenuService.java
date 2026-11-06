package com.restaurant.app.service;

import com.restaurant.app.entity.MenuItem;
import com.restaurant.app.repository.MenuItemRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    public MenuService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    // Retrieve all available food products
    public List<MenuItem> getAvailableMenuItems() {
        return menuItemRepository.findByAvailableTrue();
    }

    // Retrieve all food products
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    // Find a specific food product
    public Optional<MenuItem> getMenuItemById(Long id) {
        return menuItemRepository.findById(id);
    }

    // Retrieve food products by category
    public List<MenuItem> getMenuItemsByCategory(String category) {
        return menuItemRepository.findByCategory(category);
    }
}