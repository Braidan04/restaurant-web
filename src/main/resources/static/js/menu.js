
let allMenuItems = [];

let selectedCategory = "All";
let searchTerm = "";

let cart = [];

try {
    const savedCart = JSON.parse(localStorage.getItem("restaurantCart"));
    cart = Array.isArray(savedCart) ? savedCart : [];
} catch (error) {
    console.error("Could not load saved cart:", error);
    cart = [];
}


// =========================================
// START APPLICATION
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    loadMenu();
    setupMenuFilters();
    updateCartCount();
});


// =========================================
// LOAD MENU FROM SPRING BOOT API
// =========================================

async function loadMenu() {

    const menuContainer = document.getElementById("menu-container");

    if (menuContainer) {
        menuContainer.textContent = "Loading our delicious menu...";
    }

    try {

        const response = await fetch("/api/menu");

        if (!response.ok) {
            throw new Error("Could not retrieve menu. HTTP " + response.status);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("The server returned an invalid menu.");
        }

        allMenuItems = data;

        displayMenu();
        displayRecommendedProducts();
        displayBozzaMeals();

    } catch (error) {

        console.error("Menu loading error:", error);

        if (menuContainer) {
            menuContainer.textContent =
                "Sorry, our menu is temporarily unavailable. Please try again later.";
        }

        const recommendedContainer =
            document.getElementById("recommended-container");

        if (recommendedContainer) {
            recommendedContainer.textContent =
                "Customer favourites are temporarily unavailable.";
        }

        const bozzaContainer =
            document.getElementById("bozza-container");

        if (bozzaContainer) {
            bozzaContainer.textContent =
                "Special meals are temporarily unavailable.";
        }
    }
}


// =========================================
// SEARCH AND CATEGORY FILTERS
// =========================================

function setupMenuFilters() {

    const filterButtons = document.querySelectorAll(".filter-btn");

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const clickedCategory = button.dataset.category;

            selectedCategory =
                selectedCategory === clickedCategory
                    ? "All"
                    : clickedCategory;

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            if (selectedCategory !== "All") {
                button.classList.add("active");
            }

            displayMenu();
        });
    });

    const searchInput = document.getElementById("menu-search");

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            searchTerm = searchInput.value.toLowerCase().trim();

            displayMenu();
        });
    }
}


// =========================================
// CATEGORY PLACEHOLDER ICONS
// =========================================

function getCategoryEmoji(category) {

    const emojis = {
        Burgers: "🍔",
        Kota: "🥪",
        Sandwiches: "🥙",
        Hotdogs: "🌭",
        Pizza: "🍕"
    };

    return emojis[category] || "🍽️";
}


// =========================================
// CREATE PRODUCT IMAGE
// =========================================


function createProductImage(item) {

    const imageWrapper = document.createElement("div");

    imageWrapper.classList.add("menu-card-image-wrapper");

    const image = document.createElement("img");

    image.classList.add("menu-product-image");

    image.alt = item.name || "Restaurant menu item";
    image.loading = "lazy";
    image.decoding = "async";

    image.addEventListener("load", () => {
        image.style.display = "block";
    });

    image.addEventListener("error", () => {
        image.style.display = "none";
    });

    imageWrapper.appendChild(image);

    if (item.image && item.image.trim() !== "") {
        image.src = item.image;
    } else {
        image.style.display = "none";
    }

    return imageWrapper;
}


// =========================================
// CREATE PRODUCT BADGES
// =========================================

function createProductBadges(item) {

    const badgeContainer = document.createElement("div");

    badgeContainer.classList.add("product-badges");

    if (item.recommended === true) {

        const recommendedBadge = document.createElement("span");

        recommendedBadge.classList.add(
            "product-badge",
            "recommended-badge"
        );

        recommendedBadge.textContent = "RECOMMENDED";

        badgeContainer.appendChild(recommendedBadge);
    }

    if (item.bozza === true) {

        const bozzaBadge = document.createElement("span");

        bozzaBadge.classList.add(
            "product-badge",
            "bozza-badge"
        );

        bozzaBadge.textContent = "BOZZA & KILL MATCH";

        badgeContainer.appendChild(bozzaBadge);
    }

    return badgeContainer;
}


// =========================================
// CREATE REUSABLE PRODUCT CARD
// =========================================

function createProductCard(item) {

    const menuCard = document.createElement("article");

    menuCard.classList.add("menu-card");

    // IMAGE AND BADGES

    const imageWrapper = createProductImage(item);

    const badges = createProductBadges(item);

    if (badges.children.length > 0) {
        imageWrapper.appendChild(badges);
    }

    // CARD CONTENT

    const content = document.createElement("div");

    content.classList.add("menu-card-content");

    // CATEGORY

    const category = document.createElement("span");

    category.classList.add("menu-card-category");

    category.textContent = item.category || "Menu Item";

    // PRODUCT NAME

    const heading = document.createElement("h3");

    heading.textContent = item.name || "Unnamed Product";

    // DESCRIPTION

    const description = document.createElement("p");

    description.classList.add("menu-card-description");

    description.textContent =
        item.description || "A delicious meal prepared for you.";

    // PRICE

    const price = document.createElement("strong");

    price.classList.add("menu-card-price");

    price.textContent = formatPrice(item.price);

    // ADD TO CART BUTTON

    const addButton = document.createElement("button");

    addButton.type = "button";

    addButton.classList.add("add-to-cart-btn");

    addButton.textContent = "Add to Cart";

    addButton.dataset.id = item.id;

    addButton.setAttribute(
        "aria-label",
        "Add " + (item.name || "product") + " to cart"
    );

    // BUILD CARD

    content.append(
        category,
        heading,
        description,
        price,
        addButton
    );

    menuCard.append(
        imageWrapper,
        content
    );

    return menuCard;
}


// =========================================
// DISPLAY ALL AVAILABLE MENU PRODUCTS
// =========================================

function displayMenu() {

    const menuContainer = document.getElementById("menu-container");

    if (!menuContainer) return;

    menuContainer.innerHTML = "";

    const filteredItems = allMenuItems.filter(item => {

        const matchesCategory =
            selectedCategory === "All" ||
            item.category === selectedCategory;

        const itemName = (item.name || "").toLowerCase();

        const itemDescription =
            (item.description || "").toLowerCase();

        const matchesSearch =
            itemName.includes(searchTerm) ||
            itemDescription.includes(searchTerm);

        return item.available === true &&
            matchesCategory &&
            matchesSearch;
    });

    if (filteredItems.length === 0) {

        menuContainer.innerHTML =
            "<p class='empty-menu'>No meals found. Try another search.</p>";

        return;
    }

    filteredItems.forEach(item => {

        menuContainer.appendChild(createProductCard(item));
    });
}


// =========================================
// DISPLAY CUSTOMER FAVOURITES
// =========================================

function displayRecommendedProducts() {

    const recommendedContainer =
        document.getElementById("recommended-container");

    if (!recommendedContainer) return;

    recommendedContainer.innerHTML = "";

    const recommendedItems = allMenuItems.filter(item => {

        return item.available === true &&
            item.recommended === true;
    });

    const shuffledItems = [...recommendedItems].sort(
        () => Math.random() - 0.5
    );

    const selectedItems = shuffledItems.slice(0, 4);

    if (selectedItems.length === 0) {

        recommendedContainer.innerHTML =
            "<p class='empty-menu'>Our customer favourites are coming soon.</p>";

        return;
    }

    selectedItems.forEach(item => {

        recommendedContainer.appendChild(createProductCard(item));
    });
}


// =========================================
// DISPLAY BOZZA AND KILL MATCH MEALS
// =========================================

function displayBozzaMeals() {

    const bozzaContainer =
        document.getElementById("bozza-container");

    if (!bozzaContainer) return;

    bozzaContainer.innerHTML = "";

    const bozzaItems = allMenuItems.filter(item => {

        return item.available === true &&
            item.bozza === true;
    });

    if (bozzaItems.length === 0) {

        bozzaContainer.innerHTML =
            "<p class='empty-menu'>Special meals will be available soon.</p>";

        return;
    }

    bozzaItems.forEach(item => {

        bozzaContainer.appendChild(createProductCard(item));
    });
}


// =========================================
// ADD PRODUCT TO CART
// =========================================

function addToCart(itemId) {

    const selectedItem = allMenuItems.find(
        item =>
            Number(item.id) === Number(itemId) &&
            item.available === true
    );

    if (!selectedItem) {

        alert("Sorry, this product is currently unavailable.");

        return;
    }

    const existingItem = cart.find(
        item => Number(item.id) === Number(itemId)
    );

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({

            id: selectedItem.id,

            name: selectedItem.name,

            price: Number(selectedItem.price),

            image: selectedItem.image || "",

            quantity: 1
        });
    }

    saveCart();

    updateCartCount();

    alert(selectedItem.name + " added to your cart!");
}


// =========================================
// SAVE CART
// =========================================

function saveCart() {

    try {

        localStorage.setItem(
            "restaurantCart",
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error("Could not save cart:", error);

        alert("Your cart could not be saved. Please try again.");
    }
}


// =========================================
// HANDLE ADD TO CART BUTTONS
// =========================================

document.addEventListener("click", event => {

    const button = event.target.closest(".add-to-cart-btn");

    if (button) {

        const itemId = Number(button.dataset.id);

        addToCart(itemId);
    }
});


// =========================================
// UPDATE CART COUNT
// =========================================

function updateCartCount() {

    const cartCount = document.getElementById("cart-count");

    if (cartCount) {

        const totalItems = cart.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        );

        cartCount.textContent = totalItems;
    }
}


// =========================================
// FORMAT SOUTH AFRICAN CURRENCY
// =========================================

function formatPrice(amount) {

    const price = Number(amount);

    if (!Number.isFinite(price)) {
        return "R0.00";
    }

    return "R" + price.toFixed(2);
}
