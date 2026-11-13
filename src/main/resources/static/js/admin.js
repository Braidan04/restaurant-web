"use strict";

// ==========================================
// RESTAURANT ADMIN DASHBOARD
// ==========================================

const BOOKINGS_API = "/api/bookings";
const MENU_API = "/api/menu";

const bookingsTableBody =
    document.getElementById("bookings-table-body");

const bookingSearch =
    document.getElementById("booking-search");

const bookingStatusFilter =
    document.getElementById("booking-status-filter");

const refreshBookingsButton =
    document.getElementById("refresh-bookings");

const adminMessage =
    document.getElementById("admin-message");

// BOOKING DETAILS MODAL

const bookingModal =
    document.getElementById("booking-details-modal");

const closeModalButton =
    document.getElementById("close-booking-modal");

const closeModalFooterButton =
    document.getElementById("close-booking-modal-footer");

const modalBookingMessage =
    document.getElementById("modal-booking-message");

let allBookings = [];
let allMenuItems = [];


// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    setDashboardDate();

    loadBookings();
    initializeMenuManagement();

    bookingSearch.addEventListener(
        "input",
        renderBookings
    );

    bookingStatusFilter.addEventListener(
        "change",
        renderBookings
    );

    refreshBookingsButton.addEventListener(
        "click",
        loadBookings
    );

    closeModalButton.addEventListener(
        "click",
        closeBookingModal
    );

    closeModalFooterButton.addEventListener(
        "click",
        closeBookingModal
    );

    bookingModal.addEventListener("click", function (event) {

        if (event.target === bookingModal) {
            closeBookingModal();
        }

    });

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape" && !bookingModal.hidden) {
            closeBookingModal();
        }

    });

});


// ==========================================
// DISPLAY CURRENT DATE
// ==========================================

function setDashboardDate() {

    const dateElement =
        document.getElementById("dashboard-date");

    const today = new Date();

    dateElement.textContent = today.toLocaleDateString(
        "en-ZA",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


// ==========================================
// LOAD BOOKINGS FROM SPRING BOOT
// ==========================================

async function loadBookings() {

    bookingsTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="table-message">
                Loading collection bookings...
            </td>
        </tr>
    `;

    adminMessage.textContent = "";

    refreshBookingsButton.disabled = true;

    try {

        const response = await fetch(BOOKINGS_API);

        if (!response.ok) {
            throw new Error(
                "Unable to retrieve collection bookings."
            );
        }

        const bookingData = await response.json();

        allBookings = Array.isArray(bookingData)
            ? bookingData
            : [];

        updateDashboardStatistics();

        renderBookings();

        adminMessage.textContent =
            "Collection bookings loaded successfully.";

    } catch (error) {

        console.error("Booking loading error:", error);

        bookingsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-message">
                    Failed to load bookings. Please try again.
                </td>
            </tr>
        `;

        adminMessage.textContent =
            "Error: Could not connect to the booking API.";

    } finally {

        refreshBookingsButton.disabled = false;

    }

}


// ==========================================
// UPDATE DASHBOARD STATISTICS
// ==========================================

function updateDashboardStatistics() {

    const totalBookings = allBookings.length;

    const statusCounts = {
        BOOKED: 0,
        ARRIVED: 0,
        PREPARING: 0,
        READY: 0,
        COLLECTED: 0,
        CANCELLED: 0
    };

    allBookings.forEach(booking => {

        const status = String(
            booking.status || ""
        ).toUpperCase();

        if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
            statusCounts[status]++;
        }

    });


    const dashboardStatistics = {

        "total-bookings": totalBookings,
        "booked-count": statusCounts.BOOKED,
        "arrived-count": statusCounts.ARRIVED,
        "preparing-count": statusCounts.PREPARING,
        "ready-count": statusCounts.READY,
        "collected-count": statusCounts.COLLECTED,
        "cancelled-count": statusCounts.CANCELLED

    };

    Object.entries(dashboardStatistics).forEach(
        ([elementId, value]) => {

            const element =
                document.getElementById(elementId);

            if (element) {
                element.textContent = value;
            }

        }
    );


    // COMPLETION RATE

    const completionRate = totalBookings === 0
        ? 0
        : (statusCounts.COLLECTED / totalBookings) * 100;

    const completionRateElement =
        document.getElementById("completion-rate");

    if (completionRateElement) {

        completionRateElement.textContent =
            `${completionRate.toFixed(1)}%`;

    }


    // OVERVIEW COUNTS

    const overviewCounts = {

        "overview-booked-count": statusCounts.BOOKED,
        "overview-arrived-count": statusCounts.ARRIVED,
        "overview-preparing-count": statusCounts.PREPARING,
        "overview-ready-count": statusCounts.READY,
        "overview-collected-count": statusCounts.COLLECTED,
        "overview-cancelled-count": statusCounts.CANCELLED

    };

    Object.entries(overviewCounts).forEach(
        ([elementId, count]) => {

            const element =
                document.getElementById(elementId);

            if (element) {
                element.textContent = count;
            }

        }
    );


    // PROGRESS BARS

    const progressBars = {

        "progress-booked": statusCounts.BOOKED,
        "progress-arrived": statusCounts.ARRIVED,
        "progress-preparing": statusCounts.PREPARING,
        "progress-ready": statusCounts.READY,
        "progress-collected": statusCounts.COLLECTED,
        "progress-cancelled": statusCounts.CANCELLED

    };

    Object.entries(progressBars).forEach(
        ([elementId, count]) => {

            const progressBar =
                document.getElementById(elementId);

            if (progressBar) {

                const percentage = totalBookings === 0
                    ? 0
                    : (count / totalBookings) * 100;

                progressBar.style.width =
                    `${percentage}%`;

                progressBar.setAttribute(
                    "aria-valuenow",
                    percentage.toFixed(1)
                );

            }

        }
    );

}


// ==========================================
// SEARCH AND FILTER BOOKINGS
// ==========================================

function renderBookings() {

    const searchText =
        bookingSearch.value.trim().toLowerCase();

    const selectedStatus =
        bookingStatusFilter.value;

    const filteredBookings = allBookings.filter(
        booking => {

            const bookingNumber =
                String(booking.bookingNumber || "").toLowerCase();

            const customerName =
                String(booking.customerName || "").toLowerCase();

            const phone =
                String(booking.phone || "").toLowerCase();

            const email =
                String(booking.email || "").toLowerCase();

            const matchesSearch =
                bookingNumber.includes(searchText) ||
                customerName.includes(searchText) ||
                phone.includes(searchText) ||
                email.includes(searchText);

            const matchesStatus =
                selectedStatus === "ALL" ||
                booking.status === selectedStatus;

            return matchesSearch && matchesStatus;

        }
    );


    if (filteredBookings.length === 0) {

        bookingsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-message">
                    No collection bookings found.
                </td>
            </tr>
        `;

        return;

    }


    bookingsTableBody.innerHTML = "";

    filteredBookings.forEach(booking => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <strong class="booking-reference">
                    ${escapeHTML(booking.bookingNumber || "N/A")}
                </strong>
            </td>

            <td>
                ${escapeHTML(booking.customerName || "N/A")}
            </td>

            <td>
                ${escapeHTML(booking.phone || "N/A")}
            </td>

            <td>
                ${formatDate(booking.createdAt)}
            </td>

            <td>
                <span class="status-badge status-${escapeHTML(
                    String(booking.status || "").toLowerCase()
                )}">
                    ${escapeHTML(booking.status || "UNKNOWN")}
                </span>
            </td>

            <td>
                ${createActionButtons(booking)}
            </td>
        `;

        bookingsTableBody.appendChild(row);

    });

}


// ==========================================
// CREATE STAFF ACTION BUTTONS
// ==========================================

function createActionButtons(booking) {

    let buttons = `
        <button
            type="button"
            class="booking-details-button"
            data-view-booking="${escapeHTML(booking.bookingNumber)}"
        >
            View Details
        </button>
    `;

    switch (booking.status) {

        case "BOOKED":

            buttons += createStatusButton(
                booking.bookingNumber,
                "ARRIVED",
                "Mark Arrived"
            );

            buttons += createStatusButton(
                booking.bookingNumber,
                "CANCELLED",
                "Cancel"
            );

            break;

        case "ARRIVED":

            buttons += createStatusButton(
                booking.bookingNumber,
                "PREPARING",
                "Start Preparing"
            );

            buttons += createStatusButton(
                booking.bookingNumber,
                "CANCELLED",
                "Cancel"
            );

            break;

        case "PREPARING":

            buttons += createStatusButton(
                booking.bookingNumber,
                "READY",
                "Mark Ready"
            );

            buttons += createStatusButton(
                booking.bookingNumber,
                "CANCELLED",
                "Cancel"
            );

            break;

        case "READY":

            buttons += createStatusButton(
                booking.bookingNumber,
                "COLLECTED",
                "Mark Collected"
            );

            break;

        case "COLLECTED":

            buttons += `
                <span class="action-completed">
                    Completed
                </span>
            `;

            break;

        case "CANCELLED":

            buttons += `
                <span class="action-cancelled">
                    Cancelled
                </span>
            `;

            break;

        default:
            break;

    }

    return buttons;

}


// ==========================================
// CREATE STATUS BUTTON
// ==========================================

function createStatusButton(
    bookingNumber,
    newStatus,
    buttonLabel
) {

    return `
        <button
            type="button"
            class="booking-action-button"
            data-booking-number="${escapeHTML(bookingNumber)}"
            data-new-status="${escapeHTML(newStatus)}"
        >
            ${escapeHTML(buttonLabel)}
        </button>
    `;

}


// ==========================================
// HANDLE BOOKING TABLE CLICKS
// ==========================================

bookingsTableBody.addEventListener(
    "click",
    async function (event) {

        const detailsButton = event.target.closest(
            ".booking-details-button"
        );

        if (detailsButton) {

            const bookingNumber =
                detailsButton.dataset.viewBooking;

            await openBookingDetails(bookingNumber);

            return;

        }


        const button = event.target.closest(
            ".booking-action-button"
        );

        if (!button) {
            return;
        }

        const bookingNumber =
            button.dataset.bookingNumber;

        const newStatus =
            button.dataset.newStatus;

        const confirmed = confirm(
            `Update booking ${bookingNumber} to ${newStatus}?`
        );

        if (!confirmed) {
            return;
        }

        await updateBookingStatus(
            bookingNumber,
            newStatus,
            button
        );

    }
);


// ==========================================
// OPEN BOOKING DETAILS
// ==========================================

async function openBookingDetails(bookingNumber) {

    bookingModal.hidden = false;

    bookingModal.setAttribute("aria-hidden", "false");

    document.getElementById("modal-booking-number").textContent =
        bookingNumber;

    document.getElementById("modal-booking-status").textContent =
        "Loading...";

    document.getElementById("modal-customer-name").textContent =
        "--";

    document.getElementById("modal-customer-phone").textContent =
        "--";

    document.getElementById("modal-customer-email").textContent =
        "--";

    document.getElementById("modal-booking-date").textContent =
        "--";

    document.getElementById("modal-booking-items").innerHTML = `
        <tr>
            <td colspan="4">Loading booking items...</td>
        </tr>
    `;

    document.getElementById("modal-booking-total").textContent =
        "R0.00";

    modalBookingMessage.textContent =
        "Retrieving booking information...";

    try {

        const response = await fetch(
            `${BOOKINGS_API}/${encodeURIComponent(bookingNumber)}`
        );

        if (!response.ok) {
            throw new Error("Unable to retrieve booking details.");
        }

        const booking = await response.json();

        displayBookingDetails(booking);

        modalBookingMessage.textContent = "";

    } catch (error) {

        console.error("Booking details error:", error);

        document.getElementById("modal-booking-items").innerHTML = `
            <tr>
                <td colspan="4">
                    Could not load booking items.
                </td>
            </tr>
        `;

        modalBookingMessage.textContent =
            "Unable to load booking details. Please try again.";

    }

}


// ==========================================
// DISPLAY BOOKING DETAILS
// ==========================================

function displayBookingDetails(booking) {

    document.getElementById("modal-booking-number").textContent =
        booking.bookingNumber || "N/A";

    const statusElement =
        document.getElementById("modal-booking-status");

    statusElement.textContent =
        booking.status || "N/A";

    statusElement.className =
        `status-badge status-${String(booking.status || "").toLowerCase()}`;

    document.getElementById("modal-customer-name").textContent =
        booking.customerName || "N/A";

    document.getElementById("modal-customer-phone").textContent =
        booking.phone || "N/A";

    document.getElementById("modal-customer-email").textContent =
        booking.email || "Not provided";

    document.getElementById("modal-booking-date").textContent =
        formatDate(booking.createdAt);


    const itemsContainer =
        document.getElementById("modal-booking-items");

    itemsContainer.innerHTML = "";

    let bookingTotal = 0;

    if (!booking.items || booking.items.length === 0) {

        itemsContainer.innerHTML = `
            <tr>
                <td colspan="4">
                    No items found for this booking.
                </td>
            </tr>
        `;

    } else {

        booking.items.forEach(item => {

            const quantity = Number(item.quantity) || 0;

            const unitPrice = Number(item.unitPrice) || 0;

            const subtotal = quantity * unitPrice;

            bookingTotal += subtotal;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${escapeHTML(item.itemName || "Unknown item")}</td>
                <td>${quantity}</td>
                <td>${formatCurrency(unitPrice)}</td>
                <td>${formatCurrency(subtotal)}</td>
            `;

            itemsContainer.appendChild(row);

        });

    }


    document.getElementById("modal-booking-total").textContent =
        formatCurrency(bookingTotal);

}


// ==========================================
// CLOSE BOOKING DETAILS MODAL
// ==========================================

function closeBookingModal() {

    bookingModal.hidden = true;

    bookingModal.setAttribute("aria-hidden", "true");

}


// ==========================================
// UPDATE BOOKING STATUS THROUGH API
// ==========================================

async function updateBookingStatus(
    bookingNumber,
    newStatus,
    button
) {

    button.disabled = true;

    button.textContent = "Updating...";

    adminMessage.textContent = "";

    try {

        const response = await fetch(
            `${BOOKINGS_API}/${encodeURIComponent(bookingNumber)}/status`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        if (!response.ok) {

            const errorMessage =
                await response.text();

            throw new Error(
                errorMessage || "Status update failed."
            );

        }

        adminMessage.textContent =
            `Booking ${bookingNumber} updated to ${newStatus}.`;

        await loadBookings();

    } catch (error) {

        console.error("Status update error:", error);

        adminMessage.textContent =
            `Could not update booking ${bookingNumber}.`;

        button.disabled = false;

        button.textContent = getButtonLabel(newStatus);

    }

}


// ==========================================
// GET BUTTON LABEL
// ==========================================

function getButtonLabel(status) {

    const labels = {

        ARRIVED: "Mark Arrived",
        PREPARING: "Start Preparing",
        READY: "Mark Ready",
        COLLECTED: "Mark Collected",
        CANCELLED: "Cancel"

    };

    return labels[status] || status;

}


// ==========================================
// FORMAT BOOKING DATE
// ==========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "N/A";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "N/A";
    }

    return date.toLocaleString(
        "en-ZA",
        {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ==========================================
// FORMAT CURRENCY
// ==========================================

function formatCurrency(amount) {

    return Number(amount || 0).toLocaleString(
        "en-ZA",
        {
            style: "currency",
            currency: "ZAR"
        }
    );

}


// ==========================================
// HTML ESCAPING
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// MENU MANAGEMENT
// ==========================================


// ==========================================
// INITIALIZE MENU MANAGEMENT
// ==========================================

function initializeMenuManagement() {

    const addMenuItemButton =
        document.getElementById("add-menu-item-button");

    const menuItemForm =
        document.getElementById("menu-item-form");

    const cancelMenuFormButton =
        document.getElementById("cancel-menu-form");

    const refreshMenuButton =
        document.getElementById("refresh-menu");

    const menuSearch =
        document.getElementById("menu-search");

    const menuCategoryFilter =
        document.getElementById("menu-category-filter");

    const menuItemsTableBody =
        document.getElementById("menu-items-table-body");

    if (!addMenuItemButton || !menuItemForm ||
        !cancelMenuFormButton || !refreshMenuButton ||
        !menuSearch || !menuCategoryFilter ||
        !menuItemsTableBody) {

        console.warn("Menu management elements were not found.");

        return;

    }

    loadMenuItems();

    addMenuItemButton.addEventListener("click", function () {
        openMenuForm();
    });

    cancelMenuFormButton.addEventListener("click", function () {
        closeMenuForm();
    });

    menuItemForm.addEventListener("submit", saveMenuItem);

    refreshMenuButton.addEventListener("click", loadMenuItems);

    menuSearch.addEventListener("input", renderMenuItems);

    menuCategoryFilter.addEventListener("change", renderMenuItems);

    menuItemsTableBody.addEventListener("click", handleMenuTableClick);

}


// ==========================================
// LOAD MENU ITEMS
// ==========================================

async function loadMenuItems() {

    const tableBody =
        document.getElementById("menu-items-table-body");

    const refreshButton =
        document.getElementById("refresh-menu");

    const message =
        document.getElementById("menu-management-message");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="table-message">
                Loading menu items...
            </td>
        </tr>
    `;

    if (message) {
        message.textContent = "";
    }

    if (refreshButton) {
        refreshButton.disabled = true;
    }

    try {

        const response = await fetch(`${MENU_API}/all`);

        if (!response.ok) {
            throw new Error("Unable to retrieve menu items.");
        }

        const menuData = await response.json();

        allMenuItems = Array.isArray(menuData) ? menuData : [];

        renderMenuItems();

        if (message) {
            message.textContent = "Menu items loaded successfully.";
        }

    } catch (error) {

        console.error("Menu loading error:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-message">
                    Failed to load menu items. Please try again.
                </td>
            </tr>
        `;

        if (message) {
            message.textContent =
                "Error: Could not connect to the menu API.";
        }

    } finally {

        if (refreshButton) {
            refreshButton.disabled = false;
        }

    }

}


// ==========================================
// RENDER MENU ITEMS
// ==========================================

function renderMenuItems() {

    const tableBody =
        document.getElementById("menu-items-table-body");

    const searchInput =
        document.getElementById("menu-search");

    const categoryFilter =
        document.getElementById("menu-category-filter");

    if (!tableBody || !searchInput || !categoryFilter) {
        return;
    }

    const searchText =
        searchInput.value.trim().toLowerCase();

    const selectedCategory =
        categoryFilter.value;

    const filteredItems = allMenuItems.filter(item => {

        const name = String(item.name || "").toLowerCase();

        const category = String(item.category || "").toLowerCase();

        const description =
            String(item.description || "").toLowerCase();

        const matchesSearch =
            name.includes(searchText) ||
            category.includes(searchText) ||
            description.includes(searchText);

        const matchesCategory =
            selectedCategory === "ALL" ||
            item.category === selectedCategory;

        return matchesSearch && matchesCategory;

    });

    if (filteredItems.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-message">
                    No menu items found.
                </td>
            </tr>
        `;

        return;

    }

    tableBody.innerHTML = "";

    filteredItems.forEach(item => {

        const row = document.createElement("tr");

        const available = item.available === true;

        const recommended = item.recommended === true;

        const bozza = item.bozza === true;

        const specials = [];

        if (recommended) {
            specials.push("Recommended");
        }

        if (bozza) {
            specials.push("Bozza & Kill Match");
        }

        row.innerHTML = `
            <td>
                <strong>
                    ${escapeHTML(item.name || "Unnamed item")}
                </strong>

                ${
                    item.description
                        ? `<small class="menu-item-description">${escapeHTML(item.description)}</small>`
                        : ""
                }
            </td>

            <td>
                ${escapeHTML(item.category || "N/A")}
            </td>

            <td>
                ${formatCurrency(item.price)}
            </td>

            <td>
                <span class="status-badge ${
                    available ? "status-ready" : "status-cancelled"
                }">
                    ${available ? "Available" : "Unavailable"}
                </span>
            </td>

            <td>
                ${
                    specials.length > 0
                        ? specials.map(special =>
                            `<span class="menu-special-label">${escapeHTML(special)}</span>`
                        ).join("<br>")
                        : "—"
                }
            </td>

            <td>
                <div class="menu-action-buttons">

                    <button
                        type="button"
                        class="booking-details-button"
                        data-edit-menu="${Number(item.id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="booking-action-button"
                        data-toggle-menu="${Number(item.id)}"
                        data-available="${available}"
                    >
                        ${available ? "Disable" : "Enable"}
                    </button>

                    <button
                        type="button"
                        class="menu-delete-button"
                        data-delete-menu="${Number(item.id)}"
                    >
                        Delete
                    </button>

                </div>
            </td>
        `;

        tableBody.appendChild(row);

    });

}


// ==========================================
// OPEN MENU FORM
// ==========================================

function openMenuForm(item = null) {

    const formContainer =
        document.getElementById("menu-item-form-container");

    const formTitle =
        document.getElementById("menu-form-title");

    const form =
        document.getElementById("menu-item-form");

    const submitButton =
        document.getElementById("menu-submit-button");

    const formMessage =
        document.getElementById("menu-form-message");

    if (!formContainer || !form) {
        return;
    }

    form.reset();

    document.getElementById("menu-item-id").value =
        item ? item.id : "";

    document.getElementById("menu-name").value =
        item ? item.name || "" : "";

    document.getElementById("menu-category").value =
        item ? item.category || "" : "";

    document.getElementById("menu-price").value =
        item ? item.price || "" : "";

    document.getElementById("menu-image").value =
        item ? item.image || "" : "";

    document.getElementById("menu-description").value =
        item ? item.description || "" : "";

    document.getElementById("menu-available").checked =
        item ? item.available === true : true;

    document.getElementById("menu-recommended").checked =
        item ? item.recommended === true : false;

    document.getElementById("menu-bozza").checked =
        item ? item.bozza === true : false;

    if (formTitle) {
        formTitle.textContent =
            item ? "Edit Menu Item" : "Add New Menu Item";
    }

    if (submitButton) {
        submitButton.textContent =
            item ? "Update Menu Item" : "Save Menu Item";
    }

    if (formMessage) {
        formMessage.textContent = "";
    }

    formContainer.hidden = false;

    formContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================
// CLOSE MENU FORM
// ==========================================

function closeMenuForm() {

    const formContainer =
        document.getElementById("menu-item-form-container");

    const form =
        document.getElementById("menu-item-form");

    const formMessage =
        document.getElementById("menu-form-message");

    if (form) {
        form.reset();
    }

    if (formContainer) {
        formContainer.hidden = true;
    }

    if (formMessage) {
        formMessage.textContent = "";
    }

}


// ==========================================
// SAVE NEW OR UPDATED MENU ITEM
// ==========================================

async function saveMenuItem(event) {

    event.preventDefault();

    const itemId =
        document.getElementById("menu-item-id").value.trim();

    const formMessage =
        document.getElementById("menu-form-message");

    const submitButton =
        document.getElementById("menu-submit-button");

    const menuItem = {

        name: document.getElementById("menu-name").value.trim(),

        category: document.getElementById("menu-category").value,

        price: Number(document.getElementById("menu-price").value),

        image: document.getElementById("menu-image").value.trim(),

        description:
            document.getElementById("menu-description").value.trim(),

        available:
            document.getElementById("menu-available").checked,

        recommended:
            document.getElementById("menu-recommended").checked,

        bozza:
            document.getElementById("menu-bozza").checked

    };

    if (!menuItem.name || !menuItem.category ||
        !Number.isFinite(menuItem.price) || menuItem.price <= 0) {

        if (formMessage) {
            formMessage.textContent =
                "Please enter a name, category and valid price.";
        }

        return;
    }

    const isEditing = itemId !== "";

    const url = isEditing
        ? `${MENU_API}/${encodeURIComponent(itemId)}`
        : MENU_API;

    const method = isEditing ? "PUT" : "POST";

    if (submitButton) {
        submitButton.disabled = true;

        submitButton.textContent =
            isEditing ? "Updating..." : "Saving...";
    }

    if (formMessage) {
        formMessage.textContent = "";
    }

    try {

        const response = await fetch(url, {

            method: method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(menuItem)

        });

        if (!response.ok) {

            const errorText = await response.text();

            throw new Error(
                errorText || "Unable to save menu item."
            );

        }

        closeMenuForm();

        showMenuMessage(
            isEditing
                ? "Menu item updated successfully."
                : "Menu item added successfully."
        );

        await loadMenuItems();

    } catch (error) {

        console.error("Menu save error:", error);

        if (formMessage) {
            formMessage.textContent =
                error.message || "Could not save menu item.";
        }

    } finally {

        if (submitButton) {

            submitButton.disabled = false;

            submitButton.textContent =
                isEditing ? "Update Menu Item" : "Save Menu Item";

        }

    }

}


// ==========================================
// HANDLE MENU TABLE ACTIONS
// ==========================================

async function handleMenuTableClick(event) {

    const editButton = event.target.closest("[data-edit-menu]");

    if (editButton) {

        const itemId = Number(editButton.dataset.editMenu);

        const item = allMenuItems.find(
            menuItem => Number(menuItem.id) === itemId
        );

        if (!item) {
            showMenuMessage("Menu item could not be found.");
            return;
        }

        openMenuForm(item);

        return;

    }


    const toggleButton = event.target.closest("[data-toggle-menu]");

    if (toggleButton) {

        const itemId = Number(toggleButton.dataset.toggleMenu);

        const currentAvailability =
            toggleButton.dataset.available === "true";

        await updateMenuAvailability(
            itemId,
            !currentAvailability,
            toggleButton
        );

        return;

    }


    const deleteButton = event.target.closest("[data-delete-menu]");

    if (deleteButton) {

        const itemId = Number(deleteButton.dataset.deleteMenu);

        const item = allMenuItems.find(
            menuItem => Number(menuItem.id) === itemId
        );

        if (!item) {
            showMenuMessage("Menu item could not be found.");
            return;
        }

        const confirmed = confirm(
            `Are you sure you want to delete "${item.name}"?`
        );

        if (!confirmed) {
            return;
        }

        await deleteMenuItem(itemId, deleteButton);

    }

}


// ==========================================
// UPDATE MENU ITEM AVAILABILITY
// ==========================================

async function updateMenuAvailability(itemId, available, button) {

    button.disabled = true;

    button.textContent = "Updating...";

    try {

        const response = await fetch(
            `${MENU_API}/${encodeURIComponent(itemId)}/availability`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    available: available
                })
            }
        );

        if (!response.ok) {

            const errorText = await response.text();

            throw new Error(
                errorText || "Availability update failed."
            );

        }

        showMenuMessage(
            `Menu item ${available ? "enabled" : "disabled"} successfully.`
        );

        await loadMenuItems();

    } catch (error) {

        console.error("Menu availability error:", error);

        showMenuMessage(
            error.message || "Could not update menu item availability."
        );

        button.disabled = false;

        button.textContent = available ? "Enable" : "Disable";

    }

}


// ==========================================
// DELETE MENU ITEM
// ==========================================

async function deleteMenuItem(itemId, button) {

    button.disabled = true;

    button.textContent = "Deleting...";

    try {

        const response = await fetch(
            `${MENU_API}/${encodeURIComponent(itemId)}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {

            const errorText = await response.text();

            throw new Error(
                errorText || "Unable to delete menu item."
            );

        }

        showMenuMessage("Menu item deleted successfully.");

        await loadMenuItems();

    } catch (error) {

        console.error("Menu deletion error:", error);

        showMenuMessage(
            error.message || "Could not delete menu item."
        );

        button.disabled = false;

        button.textContent = "Delete";

    }

}


// ==========================================
// DISPLAY MENU MANAGEMENT MESSAGE
// ==========================================

function showMenuMessage(message) {

    const element =
        document.getElementById("menu-management-message");

    if (element) {
        element.textContent = message;
    }

}