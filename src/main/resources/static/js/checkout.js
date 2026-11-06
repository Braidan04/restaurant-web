
const CART_STORAGE_KEY = "restaurantCart";
const DELIVERY_FEE = 0;

const SUPPORTED_PAYMENT_METHODS = [
    "CARD",
    "PAYFAST",
    "YOCO",
    "EFT"
];

let cart = loadCheckoutCart();
let isSubmittingOrder = false;
let submissionComplete = false;


// =========================================
// LOAD CART
// =========================================

function loadCheckoutCart() {
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
            quantity: Number(item.quantity),
            image: item.image || ""
        }));

    } catch (error) {
        console.error("Could not load checkout cart:", error);
        return [];
    }
}


// =========================================
// FORMAT CURRENCY
// =========================================

function formatPrice(amount) {
    return "R" + Number(amount).toFixed(2);
}


// =========================================
// CALCULATE SUBTOTAL
// =========================================

function calculateSubtotal() {
    return cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}


// =========================================
// DISPLAY CHECKOUT ITEMS
// =========================================

function displayCheckoutItems() {
    const container = document.getElementById("checkout-items");

    if (!container) return;

    container.innerHTML = "";

    if (cart.length === 0) {
        const message = document.createElement("p");
        message.textContent = "Your cart is empty.";
        container.appendChild(message);
        return;
    }

    cart.forEach(item => {
        const row = document.createElement("div");
        row.classList.add("checkout-item");

        const name = document.createElement("span");
        name.textContent = item.name + " × " + item.quantity;

        const price = document.createElement("strong");
        price.textContent = formatPrice(item.price * item.quantity);

        row.append(name, price);
        container.appendChild(row);
    });
}


// =========================================
// UPDATE ORDER METHOD
// =========================================

function updateOrderMethod() {
    const orderType = document.getElementById("order-type").value;

    const addressGroup = document.getElementById("address-group");
    const deliveryAddress = document.getElementById("delivery-address");

    const collectionInfo = document.getElementById("collection-info");

    const paymentSection = document.getElementById("payment-section");
    const paymentMethod = document.getElementById("payment-method");

    const button = document.getElementById("place-order-btn");

    addressGroup.hidden = true;
    collectionInfo.hidden = true;
    paymentSection.hidden = true;

    deliveryAddress.required = false;

    paymentMethod.disabled = true;
    paymentMethod.required = false;
    paymentMethod.value = "";

    if (orderType === "COLLECTION") {

        collectionInfo.hidden = false;

        if (button) {
            button.textContent = "Create Collection Booking →";
        }

    } else if (orderType === "DELIVERY") {

        addressGroup.hidden = false;
        deliveryAddress.required = true;

        paymentSection.hidden = false;

        paymentMethod.disabled = false;
        paymentMethod.required = true;

        if (button) {
            button.textContent = "Continue to Payment →";
        }

    } else {

        if (button) {
            button.textContent = "Continue →";
        }
    }

    updateOrderSummary();
}


// =========================================
// UPDATE ORDER SUMMARY
// =========================================

function updateOrderSummary() {
    const orderType = document.getElementById("order-type").value;

    const subtotal = calculateSubtotal();

    const deliveryFee =
        orderType === "DELIVERY" ? DELIVERY_FEE : 0;

    const total = subtotal + deliveryFee;

    document.getElementById("checkout-subtotal").textContent =
        formatPrice(subtotal);

    document.getElementById("checkout-delivery-fee").textContent =
        formatPrice(deliveryFee);

    document.getElementById("checkout-total").textContent =
        formatPrice(total);

    const deliveryFeeRow = document.getElementById("delivery-fee-row");
    const paymentBreakdown = document.getElementById("payment-breakdown");
    const summaryNote = document.getElementById("checkout-summary-note");

    deliveryFeeRow.hidden = orderType !== "DELIVERY";
    paymentBreakdown.hidden = orderType !== "DELIVERY";

    document.getElementById("amount-due-now").textContent =
        formatPrice(total);

    if (orderType === "COLLECTION") {

        summaryNote.textContent =
            "This is a collection booking. No payment is required when booking. " +
            "Food preparation starts when you arrive and present your Booking Number.";

    } else if (orderType === "DELIVERY") {

        summaryNote.textContent =
            "Your delivery total is shown above. Payment gateway integration " +
            "is coming soon. No payment will be taken at this stage.";

    } else {

        summaryNote.textContent =
            "Select your preferred order method to continue.";
    }

    updatePlaceOrderButton();
}


// =========================================
// CHECK FORM READINESS
// =========================================

function updatePlaceOrderButton() {
    const form = document.getElementById("checkout-form");

    const orderType = document.getElementById("order-type").value;

    const paymentMethod = document.getElementById("payment-method").value;

    const button = document.getElementById("place-order-btn");

    if (!form || !button) return;

    const validOrderType =
        orderType === "COLLECTION" ||
        orderType === "DELIVERY";

    const validPayment =
        orderType === "COLLECTION" ||
        (
            orderType === "DELIVERY" &&
            SUPPORTED_PAYMENT_METHODS.includes(paymentMethod)
        );

    button.disabled =
        isSubmittingOrder ||
        submissionComplete ||
        cart.length === 0 ||
        !validOrderType ||
        !validPayment ||
        !form.checkValidity();
}


// =========================================
// DISPLAY CHECKOUT MESSAGE
// =========================================

function displayCheckoutMessage(message, type = "error") {
    const messageElement = document.getElementById("checkout-error");

    if (!messageElement) return;

    messageElement.textContent = message;

    messageElement.classList.remove("success", "error", "info");
    messageElement.classList.add(type);

    messageElement.hidden = !message;
}


// =========================================
// READ BACKEND RESPONSE
// =========================================

async function readApiResponse(response) {
    const responseText = await response.text();

    let result = {};

    if (responseText) {
        try {
            result = JSON.parse(responseText);
        } catch (error) {
            result = {
                message: responseText
            };
        }
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            result.error ||
            "The request could not be completed. Please try again."
        );
    }

    return result;
}


// =========================================
// BUILD CUSTOMER REQUEST
// =========================================

function buildCustomerRequest() {
    return {
        customerName:
            document.getElementById("customer-name").value.trim(),

        phone:
            document.getElementById("customer-phone").value.trim(),

        email:
            document.getElementById("customer-email").value.trim(),

        notes:
            document.getElementById("order-notes").value.trim(),

        items: cart.map(item => ({
            menuItemId: Number(item.id),
            quantity: Number(item.quantity)
        }))
    };
}


// =========================================
// CREATE CONFIRMATION ELEMENT
// =========================================

function createConfirmationElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}


// =========================================
// SHOW COLLECTION CONFIRMATION
// =========================================

function showCollectionConfirmation(booking) {

    const form = document.getElementById("checkout-form");

    if (!form) {
        throw new Error("The checkout form could not be found.");
    }

    const previousConfirmation =
        document.getElementById("booking-confirmation-box");

    if (previousConfirmation) {
        previousConfirmation.remove();
    }

    // Main confirmation card

    const confirmationBox = document.createElement("section");

    confirmationBox.id = "booking-confirmation-box";
    confirmationBox.className = "booking-confirmation-box";

    // Confirmation heading

    const headingSection = document.createElement("div");
    headingSection.className = "checkout-confirmation-heading";

    const tick = createConfirmationElement(
        "div",
        "checkout-confirmation-icon",
        "✓"
    );

    const label = createConfirmationElement(
        "span",
        "checkout-confirmation-label",
        "COLLECTION BOOKING CONFIRMATION"
    );

    const heading = createConfirmationElement(
        "h2",
        "checkout-confirmation-title",
        "Your Collection Booking"
    );

    const description = createConfirmationElement(
        "p",
        "checkout-confirmation-description",
        "Thank you for choosing Restaurant. Your booking has been successfully received."
    );

    const status = createConfirmationElement(
        "span",
        "checkout-confirmation-status",
        booking.status || "BOOKED"
    );

    headingSection.append(
        tick,
        label,
        heading,
        description,
        status
    );

    // Booking number section

    const bookingNumberSection = document.createElement("div");
    bookingNumberSection.className = "checkout-booking-number";

    const bookingNumberLabel = createConfirmationElement(
        "span",
        "checkout-booking-number-label",
        "YOUR COLLECTION BOOKING NUMBER IS"
    );

    const bookingNumber = createConfirmationElement(
        "strong",
        "checkout-booking-number-value",
        booking.bookingNumber
    );

    const bookingNumberNote = createConfirmationElement(
        "p",
        "checkout-booking-number-note",
        "Keep this number safe. You will need to present it when you arrive at the restaurant."
    );

    bookingNumberSection.append(
        bookingNumberLabel,
        bookingNumber,
        bookingNumberNote
    );

    // Collection instructions

    const instructions = document.createElement("div");
    instructions.className = "checkout-collection-instructions";

    const instructionsHeading = createConfirmationElement(
        "h3",
        "",
        "Important Collection Information"
    );

    const instructionsText = createConfirmationElement(
        "p",
        "",
        "Your booking has been recorded successfully. Please present your unique Booking Number to our staff when you arrive at the restaurant."
    );

    const preparationText = createConfirmationElement(
        "p",
        "checkout-preparation-note",
        "Food preparation will only begin once you arrive and present your Booking Number."
    );

    const paymentText = createConfirmationElement(
        "p",
        "",
        "No online payment is required for collection bookings."
    );

    instructions.append(
        instructionsHeading,
        instructionsText,
        preparationText,
        paymentText
    );

    // Navigation buttons

    const actions = document.createElement("div");
    actions.className = "checkout-confirmation-actions";

    const homeLink = createConfirmationElement(
        "a",
        "checkout-confirmation-btn checkout-home-btn",
        "Back to Home"
    );

    homeLink.href = "index.html";

    const menuLink = createConfirmationElement(
        "a",
        "checkout-confirmation-btn checkout-menu-btn",
        "Browse Our Menu"
    );

    menuLink.href = "index.html#menu-container";

    actions.append(homeLink, menuLink);

    // Assemble confirmation card

    confirmationBox.append(
        headingSection,
        bookingNumberSection,
        instructions,
        actions
    );

    // Display confirmation

    form.hidden = true;
    form.insertAdjacentElement("afterend", confirmationBox);

    displayCheckoutMessage("");

    submissionComplete = true;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================================
// CREATE COLLECTION BOOKING
// =========================================

async function createCollectionBooking() {

    const bookingRequest = buildCustomerRequest();

    const response = await fetch("/api/bookings", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(bookingRequest)
    });

    const result = await readApiResponse(response);

    if (!result.bookingNumber) {
        throw new Error(
            "The booking was submitted, but no Booking Number was returned."
        );
    }

    // Clear cart only after successful booking

    localStorage.removeItem(CART_STORAGE_KEY);

    cart = [];

    displayCheckoutItems();

    // Show collection confirmation

    showCollectionConfirmation(result);
}


// =========================================
// DELIVERY PAYMENT PLACEHOLDER
// =========================================

function showPaymentComingSoon() {

    const paymentMethod =
        document.getElementById("payment-method");

    const selectedOption =
        paymentMethod.options[paymentMethod.selectedIndex];

    const methodName = selectedOption
        ? selectedOption.text
        : "your selected payment method";

    displayCheckoutMessage(
        "ONLINE PAYMENT COMING SOON\n\n" +
        "You selected: " + methodName + ".\n\n" +
        "This payment method has not been connected yet. " +
        "Your order has NOT been placed, no payment has been taken, " +
        "and no order number has been generated.\n\n" +
        "Please try again once online payment is available. " +
        "Your cart is still saved.",
        "info"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================================
// HANDLE CHECKOUT SUBMISSION
// =========================================

async function handleCheckoutSubmission(event) {

    event.preventDefault();

    const form = document.getElementById("checkout-form");

    const button = document.getElementById("place-order-btn");

    const orderType = document.getElementById("order-type").value;

    displayCheckoutMessage("");

    if (isSubmittingOrder || submissionComplete) {
        return;
    }

    if (cart.length === 0) {
        displayCheckoutMessage(
            "Your cart is empty. Please add meals before checkout."
        );
        return;
    }

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (orderType !== "COLLECTION" && orderType !== "DELIVERY") {
        displayCheckoutMessage(
            "Please select collection or delivery."
        );
        return;
    }

    // Delivery cannot be submitted until payment integration exists.

    if (orderType === "DELIVERY") {

        const paymentMethod =
            document.getElementById("payment-method").value;

        if (!SUPPORTED_PAYMENT_METHODS.includes(paymentMethod)) {
            displayCheckoutMessage(
                "Please select a valid payment method."
            );
            return;
        }

        showPaymentComingSoon();
        return;
    }

    // Collection booking process

    isSubmittingOrder = true;

    button.disabled = true;
    button.textContent = "Creating Booking...";

    try {

        await createCollectionBooking();

    } catch (error) {

        console.error("Checkout submission failed:", error);

        displayCheckoutMessage(
            error.message ||
            "A connection error occurred. Please try again."
        );

    } finally {

        isSubmittingOrder = false;

        updatePlaceOrderButton();
    }
}


// =========================================
// START CHECKOUT
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("checkout-form");

    const orderType = document.getElementById("order-type");

    if (!form || !orderType) {
        console.error("Checkout form or order type field was not found.");
        return;
    }

    displayCheckoutItems();

    updateOrderMethod();

    orderType.addEventListener(
        "change",
        updateOrderMethod
    );

    form.addEventListener(
        "input",
        updatePlaceOrderButton
    );

    form.addEventListener(
        "change",
        updatePlaceOrderButton
    );

    form.addEventListener(
        "submit",
        handleCheckoutSubmission
    );

});
