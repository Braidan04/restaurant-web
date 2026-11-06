package com.restaurant.app.controller;

import com.restaurant.app.entity.MenuItem;
import com.restaurant.app.service.MenuService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    // Get all available menu products
    @GetMapping
    public List<MenuItem> getMenu() {
        return menuService.getAvailableMenuItems();
    }

    // Get all products, including unavailable ones
    @GetMapping("/all")
    public List<MenuItem> getAllMenuItems() {
        return menuService.getAllMenuItems();
    }

    // Get a product by its ID
    @GetMapping("/{id}")
    public MenuItem getMenuItem(@PathVariable Long id) {
        return menuService.getMenuItemById(id)
                .orElseThrow(() ->
                        new RuntimeException("Menu item not found: " + id));
    }

    // Get products by category
    @GetMapping("/category/{category}")
    public List<MenuItem> getMenuByCategory(
            @PathVariable String category) {
        return menuService.getMenuItemsByCategory(category);
    }
}