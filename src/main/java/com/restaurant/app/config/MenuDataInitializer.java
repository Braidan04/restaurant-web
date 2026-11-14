package com.restaurant.app.config;

import com.restaurant.app.entity.MenuItem;
import com.restaurant.app.repository.MenuItemRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Component
public class MenuDataInitializer implements CommandLineRunner {

    private final MenuItemRepository menuItemRepository;

    public MenuDataInitializer(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    @Override
    public void run(String... args) {

        // Starter menu: only inserted into an empty database
        if (menuItemRepository.count() == 0) {
            insertStarterMenu();
        }

        // Newer meals (Queen Kota, Chips, Meat & Chicken, Ice Cream, Drinks, Extras)
        // are added once, matched by name, so an existing database gets them too
        updateExistingProducts();
        addMissingProducts();
    }

    /**
     * Moves existing databases onto the new menu layout:
     * - old ice creams (in Drinks) become Ice Cream Cones in the Ice Cream category
     * - chips and cold drinks get their new photos
     * Each change only applies while the row still has its old value,
     * so edits made later in the admin page are never overwritten.
     */
    private void updateExistingProducts() {

        renameProduct("Vanilla Ice Cream", "Vanilla Ice Cream Cone",
                "A scoop of creamy vanilla ice cream in a crispy waffle cone.");
        renameProduct("Chocolate Ice Cream", "Chocolate Ice Cream Cone",
                "A scoop of rich chocolate ice cream in a crispy waffle cone.");
        renameProduct("Strawberry Ice Cream", "Strawberry Ice Cream Cone",
                "A scoop of sweet strawberry ice cream in a crispy waffle cone.");

        menuItemRepository.findAll().forEach(item -> {

            boolean changed = false;
            String name = item.getName() == null ? "" : item.getName();

            if ("Drinks".equals(item.getCategory())
                    && name.toLowerCase().contains("ice cream")) {
                item.setCategory("Ice Cream");
                changed = true;
            }

            String newImage = OLD_TO_NEW_IMAGES.get(name + "|" + item.getImage());

            if (newImage != null) {
                item.setImage(newImage);
                changed = true;
            }

            if (changed) {
                menuItemRepository.save(item);
            }
        });
    }

    private void renameProduct(String oldName, String newName, String newDescription) {

        if (menuItemRepository.existsByNameIgnoreCase(newName)) {
            return;
        }

        menuItemRepository.findFirstByNameIgnoreCase(oldName).ifPresent(item -> {
            item.setName(newName);
            item.setDescription(newDescription);
            item.setCategory("Ice Cream");
            item.setPrice(BigDecimal.valueOf(15.00));
            item.setImage(OLD_TO_NEW_IMAGES.getOrDefault(
                    newName + "|" + item.getImage(), item.getImage()));
            menuItemRepository.save(item);
        });
    }

    // "Product name|old image" -> new image
    private static final Map<String, String> OLD_TO_NEW_IMAGES = Map.ofEntries(
        Map.entry("Small Chips|images/chips.jpg", "images/chips-small.jpg"),
        Map.entry("Medium Chips|images/chips.jpg", "images/chips-medium.jpg"),
        Map.entry("Large Chips|images/chips.jpg", "images/chips-large.jpg"),
        Map.entry("Vanilla Ice Cream Cone|images/icecream-vanilla.jpg", "images/icecream-cone-vanilla.jpg"),
        Map.entry("Chocolate Ice Cream Cone|images/icecream-chocolate.jpg", "images/icecream-cone-chocolate.jpg"),
        Map.entry("Strawberry Ice Cream Cone|images/icecream-strawberry.jpg", "images/icecream-cone-strawberry.jpg"),
        Map.entry("Coca-Cola 500ml|images/drink-cola.jpg", "images/drink-coca-cola.jpg"),
        Map.entry("Sprite 500ml|images/drink-sprite.jpg", "images/drink-sprite-coke.jpg"),
        Map.entry("Fanta Orange 500ml|images/drink-orange.jpg", "images/drink-fanta-orange.jpg"),
        Map.entry("Stoney 500ml|images/drink-stoney.jpg", "images/drink-stoney-ginger.jpg")
    );

    private void insertStarterMenu() {

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

    private void addMissingProducts() {

        List<MenuItem> newProducts = List.of(

            createProduct(
                "Queen Kota",
                "Kota",
                "The queen of all kotas: chips, russian, vienna, polony, cheese, egg, lettuce, atchar and our special sauce. Loaded with everything.",
                130.00,
                "images/queen-kota.jpg",
                true,
                true,
                false
            ),
            createProduct(
                "Small Chips",
                "Chips",
                "A small portion of hot, golden, freshly fried chips.",
                25.00,
                "images/chips-small.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Medium Chips",
                "Chips",
                "A medium portion of hot, golden, freshly fried chips.",
                35.00,
                "images/chips-medium.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Large Chips",
                "Chips",
                "A large portion of hot, golden, freshly fried chips. Perfect for sharing.",
                45.00,
                "images/chips-large.jpg",
                true,
                true,
                false
            ),
            createProduct(
                "Pap & Braai Chicken",
                "Meat & Chicken",
                "Soft pap with braaied chicken, served with coleslaw and scramble.",
                75.00,
                "images/pap-chicken.jpg",
                true,
                true,
                false
            ),
            createProduct(
                "Pap & Wors",
                "Meat & Chicken",
                "Soft pap with grilled wors, served with beetroot and chakalaka.",
                65.00,
                "images/pap-wors.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Pap & Beef",
                "Meat & Chicken",
                "Soft pap with tender beef, served with beetroot and chakalaka.",
                80.00,
                "images/pap-beef.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Pap & Pork",
                "Meat & Chicken",
                "Soft pap with grilled pork, served with chakalaka.",
                80.00,
                "images/pap-pork.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Vanilla Ice Cream Cone",
                "Ice Cream",
                "A scoop of creamy vanilla ice cream in a crispy waffle cone.",
                15.00,
                "images/icecream-cone-vanilla.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Chocolate Ice Cream Cone",
                "Ice Cream",
                "A scoop of rich chocolate ice cream in a crispy waffle cone.",
                15.00,
                "images/icecream-cone-chocolate.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Strawberry Ice Cream Cone",
                "Ice Cream",
                "A scoop of sweet strawberry ice cream in a crispy waffle cone.",
                15.00,
                "images/icecream-cone-strawberry.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Vanilla Ice Cream Cup",
                "Ice Cream",
                "Two scoops of creamy vanilla ice cream in a cup.",
                20.00,
                "images/icecream-cup-vanilla.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Chocolate Ice Cream Cup",
                "Ice Cream",
                "Two scoops of rich chocolate ice cream in a cup.",
                20.00,
                "images/icecream-cup-chocolate.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Strawberry Ice Cream Cup",
                "Ice Cream",
                "Two scoops of sweet strawberry ice cream in a cup.",
                20.00,
                "images/icecream-cup-strawberry.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Coca-Cola 500ml",
                "Drinks",
                "Ice-cold Coca-Cola Original Taste, 500ml.",
                18.00,
                "images/drink-coca-cola.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Sprite 500ml",
                "Drinks",
                "Ice-cold Sprite lemon-lime, 500ml. A Coca-Cola drink.",
                18.00,
                "images/drink-sprite-coke.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Fanta Orange 500ml",
                "Drinks",
                "Ice-cold Fanta Orange, 500ml. A Coca-Cola drink.",
                18.00,
                "images/drink-fanta-orange.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Stoney 500ml",
                "Drinks",
                "Ice-cold Stoney Ginger Beer, 500ml. A Coca-Cola drink.",
                18.00,
                "images/drink-stoney-ginger.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Vanilla Milkshake",
                "Drinks",
                "Thick, creamy vanilla milkshake topped with whipped cream.",
                35.00,
                "images/milkshake-vanilla.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Chocolate Milkshake",
                "Drinks",
                "Thick chocolate milkshake with whipped cream and chocolate sauce.",
                35.00,
                "images/milkshake-chocolate.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Strawberry Milkshake",
                "Drinks",
                "Thick strawberry milkshake topped with whipped cream.",
                35.00,
                "images/milkshake-strawberry.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Mojito Cocktail",
                "Drinks",
                "Fresh mint, lime and crushed ice.",
                55.00,
                "images/cocktail-mojito.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Pina Colada Cocktail",
                "Drinks",
                "Creamy pineapple and coconut, garnished with pineapple and a cherry.",
                55.00,
                "images/cocktail-pina-colada.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Strawberry Daiquiri Cocktail",
                "Drinks",
                "Frozen strawberry and lime with a sugared rim.",
                55.00,
                "images/cocktail-strawberry-daiquiri.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Wors Piece",
                "Extras",
                "A piece of grilled wors. From R10.",
                10.00,
                "images/extra-wors.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Russian",
                "Extras",
                "One russian sausage.",
                7.00,
                "images/extra-russian.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Polony",
                "Extras",
                "A portion of polony.",
                5.00,
                "images/extra-polony.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Eggs",
                "Extras",
                "A portion of eggs.",
                5.00,
                "images/extra-eggs.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Vienna",
                "Extras",
                "One vienna sausage.",
                5.00,
                "images/extra-vienna.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Chakalaka",
                "Extras",
                "A side of spicy chakalaka.",
                6.00,
                "images/extra-chakalaka.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Beetroot",
                "Extras",
                "A side of beetroot salad.",
                7.00,
                "images/extra-beetroot.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Coleslaw",
                "Extras",
                "A side of creamy coleslaw.",
                7.00,
                "images/extra-coleslaw.jpg",
                true,
                false,
                false
            ),
            createProduct(
                "Scramble",
                "Extras",
                "A side of scrambled eggs.",
                8.00,
                "images/extra-scramble.jpg",
                true,
                false,
                false
            )
        );

        int added = 0;

        for (MenuItem product : newProducts) {
            if (!menuItemRepository.existsByNameIgnoreCase(product.getName())) {
                menuItemRepository.save(product);
                added++;
            }
        }

        if (added > 0) {
            System.out.println("NEW MENU ITEMS ADDED: " + added);
        }
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