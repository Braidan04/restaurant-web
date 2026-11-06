package com.restaurant.app.config;

import com.restaurant.app.entity.MenuItem;
import com.restaurant.app.repository.MenuItemRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class MenuDataInitializer implements CommandLineRunner {

    private final MenuItemRepository menuItemRepository;

    public MenuDataInitializer(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    @Override
    public void run(String... args) {

        // Avoid inserting duplicate sample products
        if (menuItemRepository.count() > 0) {
            return;
        }

        List<MenuItem> products = List.of(

            createProduct(
                "Classic Beef Burger",
                "Burgers",
                "Juicy beef patty with fresh lettuce, tomato and our signature sauce.",
                65.00,
                "images/classic-beef-burger.jpg",
                true,
                true,
                false
            ),

            createProduct(
                "Bozza Double Burger Meal",
                "Burgers",
                "Double beef burger served with crispy chips.",
                110.00,
                "images/bozza-double-burger.jpg",
                true,
                true,
                true
            ),

            createProduct(
                "Classic Kota",
                "Kota",
                "Traditional kota filled with delicious everyday favourites.",
                45.00,
                "images/classic-kota.jpg",
                true,
                true,
                false
            ),

            createProduct(
                "Bozza Loaded Kota",
                "Kota",
                "A loaded kota packed with flavour and generous fillings.",
                85.00,
                "images/bozza-loaded-kota.jpg",
                true,
                true,
                true
            ),

            createProduct(
                "Chicken Mayo Sandwich",
                "Sandwiches",
                "Fresh sandwich filled with chicken and creamy mayonnaise.",
                50.00,
                "images/chicken-mayo-sandwich.jpg",
                true,
                false,
                false
            ),

            createProduct(
                "Kill Match Steak Sandwich",
                "Sandwiches",
                "Tender steak sandwich with a delicious combination of sauces.",
                90.00,
                "images/kill-match-steak-sandwich.jpg",
                true,
                true,
                true
            ),

            createProduct(
                "Classic Hotdog",
                "Hotdogs",
                "Classic hotdog served with sauces and fresh toppings.",
                40.00,
                "images/classic-hotdog.jpg",
                true,
                false,
                false
            ),

            createProduct(
                "Bozza Loaded Hotdog",
                "Hotdogs",
                "Loaded hotdog with extra toppings and signature sauce.",
                75.00,
                "images/bozza-loaded-hotdog.jpg",
                true,
                true,
                true
            ),

            createProduct(
                "Classic Cheese Pizza",
                "Pizza",
                "Delicious pizza topped with melted cheese.",
                95.00,
                "images/classic-cheese-pizza.jpg",
                true,
                false,
                false
            ),

            createProduct(
                "Kill Match Meat Feast Pizza",
                "Pizza",
                "Meat feast pizza loaded with a selection of toppings.",
                145.00,
                "images/kill-match-meat-feast-pizza.jpg",
                true,
                true,
                true
            )
        );

        menuItemRepository.saveAll(products);

        System.out.println("==================================");
        System.out.println("RESTAURANT MENU INITIALIZED");
        System.out.println("Products inserted: " + products.size());
        System.out.println("==================================");
    }

    private MenuItem createProduct(
            String name,
            String category,
            String description,
            double price,
            String image,
            boolean available,
            boolean recommended,
            boolean bozza) {

        MenuItem item = new MenuItem();

        item.setName(name);
        item.setCategory(category);
        item.setDescription(description);
        item.setPrice(BigDecimal.valueOf(price));
        item.setImage(image);
        item.setAvailable(available);
        item.setRecommended(recommended);
        item.setBozza(bozza);

        return item;
    }
}