package com.restaurant.app.repository;

import com.restaurant.app.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByAvailableTrue();

    List<MenuItem> findByCategory(String category);

    boolean existsByNameIgnoreCase(String name);

    Optional<MenuItem> findFirstByNameIgnoreCase(String name);

}

