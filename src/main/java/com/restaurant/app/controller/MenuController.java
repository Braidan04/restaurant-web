
package com.restaurant.app.controller;

import com.restaurant.app.entity.MenuItem;
import com.restaurant.app.service.MenuService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    // ==========================================
    // GET ALL AVAILABLE MENU PRODUCTS
    // ==========================================

    @GetMapping
    public List<MenuItem> getMenu() {
        return menuService.getAvailableMenuItems();
    }

    // ==========================================
    // GET ALL MENU PRODUCTS
    // INCLUDING UNAVAILABLE PRODUCTS
    // ==========================================

    @GetMapping("/all")
    public List<MenuItem> getAllMenuItems() {
        return menuService.getAllMenuItems();
    }

    // ==========================================
    // GET MENU PRODUCT BY ID
    // ==========================================

    @GetMapping("/{id}")
    public MenuItem getMenuItem(@PathVariable Long id) {

        return menuService.getMenuItemById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Menu item not found: " + id
                        ));
    }

    // ==========================================
    // GET MENU PRODUCTS BY CATEGORY
    // ==========================================

    @GetMapping("/category/{category}")
    public List<MenuItem> getMenuByCategory(
            @PathVariable String category) {

        return menuService.getMenuItemsByCategory(category);
    }

    // ==========================================
    // ADD NEW MENU PRODUCT
    // POST /api/menu
    // ==========================================

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MenuItem addMenuItem(
            @RequestBody MenuItem menuItem) {

        return menuService.addMenuItem(menuItem);
    }

    // ==========================================
    // UPDATE EXISTING MENU PRODUCT
    // PUT /api/menu/{id}
    // ==========================================

    @PutMapping("/{id}")
    public MenuItem updateMenuItem(
            @PathVariable Long id,
            @RequestBody MenuItem menuItem) {

        return menuService.updateMenuItem(id, menuItem);
    }

    // ==========================================
    // UPDATE MENU PRODUCT AVAILABILITY
    // PATCH /api/menu/{id}/availability
    // ==========================================

    @PatchMapping("/{id}/availability")
    public MenuItem updateAvailability(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {

        Boolean available = request.get("available");

        if (available == null) {
            throw new IllegalArgumentException(
                    "Availability value is required."
            );
        }

        return menuService.updateAvailability(id, available);
    }

    // ==========================================
    // DELETE MENU PRODUCT
    // DELETE /api/menu/{id}
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(
            @PathVariable Long id) {

        menuService.deleteMenuItem(id);

        return ResponseEntity.noContent().build();
    }
}
