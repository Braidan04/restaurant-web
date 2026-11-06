
"use strict";

// ==========================================
// RESTAURANT CUSTOMER COLLECTION DISPLAY
// ==========================================

const DISPLAY_BOOKINGS_API = "/api/bookings";

const preparingList =
    document.getElementById("preparing-list");

const readyList =
    document.getElementById("ready-list");

const displayClock =
    document.getElementById("display-clock");

const REFRESH_INTERVAL = 5000;


// ==========================================
// INITIALIZE DISPLAY
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    updateDisplayClock();

    setInterval(updateDisplayClock, 1000);

    loadDisplayBookings();

    setInterval(
        loadDisplayBookings,
        REFRESH_INTERVAL
    );

});


// ==========================================
// UPDATE DIGITAL CLOCK
// ==========================================

function updateDisplayClock() {

    const now = new Date();

    displayClock.textContent =
        now.toLocaleTimeString(
            "en-ZA",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            }
        );

}


// ==========================================
// LOAD BOOKINGS
// ==========================================

async function loadDisplayBookings() {

    try {

        const response = await fetch(
            DISPLAY_BOOKINGS_API,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Could not load collection bookings."
            );
        }

        const bookings = await response.json();

        renderPreparingBookings(bookings);

        renderReadyBookings(bookings);

    } catch (error) {

        console.error(
            "Customer display loading error:",
            error
        );

        preparingList.innerHTML = `
            <div class="display-empty-message">
                Connecting to restaurant system...
            </div>
        `;

        readyList.innerHTML = `
            <div class="display-empty-message">
                Connecting to restaurant system...
            </div>
        `;

    }

}


// ==========================================
// DISPLAY BOOKINGS BEING PREPARED
// ==========================================

function renderPreparingBookings(bookings) {

    const preparingBookings = bookings.filter(
        booking => booking.status === "PREPARING"
    );

    renderBookingNumbers(
        preparingList,
        preparingBookings,
        "No bookings being prepared right now."
    );

}


// ==========================================
// DISPLAY READY BOOKINGS
// ==========================================

function renderReadyBookings(bookings) {

    const readyBookings = bookings.filter(
        booking => booking.status === "READY"
    );

    renderBookingNumbers(
        readyList,
        readyBookings,
        "No bookings ready for collection."
    );

}


// ==========================================
// RENDER BOOKING NUMBERS
// ==========================================

function renderBookingNumbers(
    container,
    bookings,
    emptyMessage
) {

    if (bookings.length === 0) {

        container.innerHTML = `
            <div class="display-empty-message">
                ${escapeHTML(emptyMessage)}
            </div>
        `;

        return;

    }

    container.innerHTML = "";

    bookings.forEach(booking => {

        const bookingCard =
            document.createElement("div");

        bookingCard.className =
            "booking-number-card";

        bookingCard.textContent =
            booking.bookingNumber;

        container.appendChild(bookingCard);

    });

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
