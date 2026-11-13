
package com.restaurant.app.service;

import com.restaurant.app.entity.MenuItem;
import com.restaurant.app.repository.MenuItemRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    // Add a new menu item
    public MenuItem addMenuItem(MenuItem menuItem) {
        validateMenuItem(menuItem);
        return menuItemRepository.save(menuItem);
    }

    // Update an existing menu item
    @Transactional
    public MenuItem updateMenuItem(Long id, MenuItem updatedItem) {

        MenuItem existingItem = menuItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Menu item not found: " + id));

        validateMenuItem(updatedItem);

        existingItem.setName(updatedItem.getName());
        existingItem.setCategory(updatedItem.getCategory());
        existingItem.setDescription(updatedItem.getDescription());
        existingItem.setPrice(updatedItem.getPrice());
        existingItem.setImage(updatedItem.getImage());
        existingItem.setAvailable(updatedItem.isAvailable());
        existingItem.setRecommended(updatedItem.isRecommended());
        existingItem.setBozza(updatedItem.isBozza());

        return menuItemRepository.save(existingItem);
    }

    // Delete a menu item
    public void deleteMenuItem(Long id) {

        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Menu item not found: " + id));

        menuItemRepository.delete(menuItem);
    }

    // Change menu item availability
    @Transactional
    public MenuItem updateAvailability(Long id, boolean available) {

        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Menu item not found: " + id));

        menuItem.setAvailable(available);

        return menuItemRepository.save(menuItem);
    }

    // Validate menu item information
    private void validateMenuItem(MenuItem menuItem) {

        if (menuItem.getName() == null ||
                menuItem.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Menu item name is required.");
        }

        if (menuItem.getCategory() == null ||
                menuItem.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Menu category is required.");
        }

        if (menuItem.getPrice() == null ||
                menuItem.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Menu price must be greater than zero.");
        }

        if (menuItem.getDescription() != null &&
                menuItem.getDescription().length() > 1000) {
            throw new IllegalArgumentException("Description cannot exceed 1000 characters.");
        }

        menuItem.setName(menuItem.getName().trim());
        menuItem.setCategory(menuItem.getCategory().trim());
    }
}
