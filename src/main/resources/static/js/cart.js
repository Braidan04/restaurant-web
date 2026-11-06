
// =========================================
// CART DATA
// =========================================

const CART_STORAGE_KEY = "restaurantCart";

let cart = loadCart();

const DELIVERY_FEE = 0;


// =========================================
// LOAD SAVED CART
// =========================================

function loadCart() {

    try {

        const savedCart = localStorage.getItem(CART_STORAGE_KEY);

        const parsedCart = savedCart ? JSON.parse(savedCart) : [];

        if (!Array.isArray(parsedCart)) {
            return [];
        }

        return parsedCart.filter(item => {

            return item &&
                item.id !== undefined &&
                typeof item.name === "string" &&
                Number.isFinite(Number(item.price)) &&
                Number(item.price) >= 0 &&
                Number.isInteger(Number(item.quantity)) &&
                Number(item.quantity) > 0;

        }).map(item => ({

            id: item.id,
            name: item.name,
            price: Number(item.price),
            image: item.image || "",
            quantity: Number(item.quantity)

        }));

    } catch (error) {

        console.error("Could not read saved cart:", error);

        return [];

    }

}


// =========================================
// SAVE CART
// =========================================

function saveCart() {

    localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
    );

}


// =========================================
// FORMAT SOUTH AFRICAN CURRENCY
// =========================================

function formatPrice(amount) {

    return "R" + Number(amount).toFixed(2);

}


// =========================================
// UPDATE CART COUNT
// =========================================

function updateCartCount() {

    const cartCount = document.getElementById("cart-count");

    if (!cartCount) return;

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalItems;

}


// =========================================
// DISPLAY EMPTY CART
// =========================================

function displayEmptyCart() {

    const cartContainer = document.getElementById("cart-items");

    cartContainer.innerHTML = "";

    const emptyMessage = document.createElement("div");

    emptyMessage.classList.add("empty-cart");

    const icon = document.createElement("div");

    icon.classList.add("empty-cart-icon");

    icon.textContent = "🛒";

    const heading = document.createElement("h3");

    heading.textContent =
        "Your cart is waiting for something delicious!";

    const description = document.createElement("p");

    description.textContent =
        "You haven't added any meals yet. Explore our menu and find something you'll love.";

    const shopLink = document.createElement("a");

    shopLink.href = "index.html#menu";

    shopLink.textContent = "Explore Our Menu";

    shopLink.classList.add("primary-button");

    emptyMessage.append(
        icon,
        heading,
        description,
        shopLink
    );

    cartContainer.appendChild(emptyMessage);

}


// =========================================
// CREATE CART PRODUCT
// =========================================

function createCartProduct(item) {

    const product = document.createElement("article");

    product.classList.add("cart-product");


    // PRODUCT IMAGE

    const image = document.createElement("img");

    image.classList.add("cart-product-image");

    image.src = item.image || "";

    image.alt = item.name;

    image.addEventListener("error", () => {

        image.style.display = "none";

    });


    // PRODUCT INFORMATION

    const information = document.createElement("div");

    information.classList.add("cart-product-info");

    const name = document.createElement("h3");

    name.textContent = item.name;

    const price = document.createElement("p");

    price.classList.add("cart-product-price");

    price.textContent = formatPrice(item.price) + " each";

    information.append(name, price);


    // QUANTITY CONTROLS

    const quantityControls = document.createElement("div");

    quantityControls.classList.add("cart-quantity-controls");

    const decreaseButton = document.createElement("button");

    decreaseButton.type = "button";

    decreaseButton.textContent = "−";

    decreaseButton.dataset.id = item.id;

    decreaseButton.dataset.action = "decrease";

    decreaseButton.setAttribute(
        "aria-label",
        "Decrease quantity"
    );


    const quantity = document.createElement("span");

    quantity.textContent = item.quantity;


    const increaseButton = document.createElement("button");

    increaseButton.type = "button";

    increaseButton.textContent = "+";

    increaseButton.dataset.id = item.id;

    increaseButton.dataset.action = "increase";

    increaseButton.setAttribute(
        "aria-label",
        "Increase quantity"
    );


    quantityControls.append(
        decreaseButton,
        quantity,
        increaseButton
    );


    // PRODUCT TOTAL

    const total = document.createElement("strong");

    total.classList.add("cart-product-total");

    total.textContent = formatPrice(
        item.price * item.quantity
    );


    // REMOVE BUTTON

    const removeButton = document.createElement("button");

    removeButton.type = "button";

    removeButton.classList.add("remove-cart-product");

    removeButton.dataset.id = item.id;

    removeButton.textContent = "Remove";


    // BUILD PRODUCT

    product.append(
        image,
        information,
        quantityControls,
        total,
        removeButton
    );

    return product;

}


// =========================================
// DISPLAY CART PRODUCTS
// =========================================

function displayCart() {

    const cartContainer = document.getElementById("cart-items");

    const subtotalElement = document.getElementById("cart-subtotal");

    const deliveryElement = document.getElementById("delivery-fee");

    const totalElement = document.getElementById("cart-total");

    const checkoutButton = document.getElementById("checkout-btn");

    if (!cartContainer) return;

    cartContainer.innerHTML = "";


    // EMPTY CART

    if (cart.length === 0) {

        displayEmptyCart();

        if (subtotalElement) {
            subtotalElement.textContent = formatPrice(0);
        }

        if (deliveryElement) {
            deliveryElement.textContent = formatPrice(0);
        }

        if (totalElement) {
            totalElement.textContent = formatPrice(0);
        }

        if (checkoutButton) {
            checkoutButton.disabled = true;
        }

        updateCartCount();

        return;

    }


    // DISPLAY PRODUCTS

    let subtotal = 0;

    cart.forEach(item => {

        subtotal += item.price * item.quantity;

        const product = createCartProduct(item);

        cartContainer.appendChild(product);

    });


    // CALCULATE TOTALS

    const total = subtotal + DELIVERY_FEE;

    if (subtotalElement) {
        subtotalElement.textContent = formatPrice(subtotal);
    }

    if (deliveryElement) {
        deliveryElement.textContent = formatPrice(DELIVERY_FEE);
    }

    if (totalElement) {
        totalElement.textContent = formatPrice(total);
    }

    if (checkoutButton) {
        checkoutButton.disabled = false;
    }

    updateCartCount();

}


// =========================================
// INCREASE OR DECREASE QUANTITY
// =========================================

function updateQuantity(itemId, action) {

    const item = cart.find(
        product => String(product.id) === String(itemId)
    );

    if (!item) return;

    if (action === "increase") {

        item.quantity++;

    } else if (action === "decrease") {

        item.quantity--;

        if (item.quantity <= 0) {

            cart = cart.filter(
                product => String(product.id) !== String(itemId)
            );

        }

    }

    saveCart();

    displayCart();

}


// =========================================
// REMOVE PRODUCT
// =========================================

function removeCartProduct(itemId) {

    cart = cart.filter(
        item => String(item.id) !== String(itemId)
    );

    saveCart();

    displayCart();

}


// =========================================
// HANDLE CART BUTTON CLICKS
// =========================================

document.addEventListener("click", event => {

    const button = event.target.closest("button");

    if (!button) return;


    // INCREASE OR DECREASE

    if (button.dataset.action) {

        updateQuantity(
            button.dataset.id,
            button.dataset.action
        );

        return;

    }


    // REMOVE PRODUCT

    if (button.classList.contains("remove-cart-product")) {

        removeCartProduct(button.dataset.id);

        return;

    }


    // PROCEED TO CHECKOUT

    if (button.id === "checkout-btn" && !button.disabled) {

        if (cart.length === 0) {
            return;
        }

        window.location.href = "checkout.html";

    }

});


// =========================================
// START CART PAGE
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    displayCart();

});
