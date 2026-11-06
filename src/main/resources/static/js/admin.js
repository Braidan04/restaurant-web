
"use strict";

// ==========================================
// RESTAURANT ADMIN DASHBOARD
// ==========================================

const BOOKINGS_API = "/api/bookings";

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


// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    setDashboardDate();

    loadBookings();

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

    // COUNT BOOKINGS BY STATUS

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


    // UPDATE MAIN DASHBOARD STATISTICS

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


    // CALCULATE COMPLETION RATE
    // Collected bookings divided by all bookings.

    const completionRate = totalBookings === 0
        ? 0
        : (statusCounts.COLLECTED / totalBookings) * 100;

    const completionRateElement =
        document.getElementById("completion-rate");

    if (completionRateElement) {

        completionRateElement.textContent =
            `${completionRate.toFixed(1)}%`;

    }


    // UPDATE BOOKING STATUS OVERVIEW COUNTS

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


    // UPDATE BOOKING STATUS PROGRESS BARS
    // All percentages are calculated against total bookings.

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

            // SEARCHABLE CUSTOMER INFORMATION

            const bookingNumber =
                String(booking.bookingNumber || "").toLowerCase();

            const customerName =
                String(booking.customerName || "").toLowerCase();

            const phone =
                String(booking.phone || "").toLowerCase();

            const email =
                String(booking.email || "").toLowerCase();


            // MATCH SEARCH TEXT

            const matchesSearch =
                bookingNumber.includes(searchText) ||
                customerName.includes(searchText) ||
                phone.includes(searchText) ||
                email.includes(searchText);


            // MATCH BOOKING STATUS

            const matchesStatus =
                selectedStatus === "ALL" ||
                booking.status === selectedStatus;

            return matchesSearch && matchesStatus;

        }
    );


    // NO RESULTS

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


    // DISPLAY FILTERED BOOKINGS

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

        // VIEW BOOKING DETAILS

        const detailsButton = event.target.closest(
            ".booking-details-button"
        );

        if (detailsButton) {

            const bookingNumber =
                detailsButton.dataset.viewBooking;

            await openBookingDetails(bookingNumber);

            return;

        }


        // UPDATE BOOKING STATUS

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


    // DISPLAY BOOKED ITEMS

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


    // DISPLAY BOOKING TOTAL

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
