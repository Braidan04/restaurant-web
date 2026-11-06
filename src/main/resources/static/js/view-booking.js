document.addEventListener("DOMContentLoaded", function () {

    const bookingNumber = new URLSearchParams(
        window.location.search
    ).get("bookingNumber");

    const loading = document.getElementById("booking-loading");
    const content = document.getElementById("booking-content");
    const errorBox = document.getElementById("booking-error");

    function showError(message) {
        loading.style.display = "none";
        content.style.display = "none";
        errorBox.textContent = message;
        errorBox.style.display = "block";
    }

    function formatDate(dateValue) {
        if (!dateValue) {
            return "Not available";
        }

        return new Date(dateValue).toLocaleString("en-ZA", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    }

    function formatCurrency(amount) {
        return Number(amount).toLocaleString("en-ZA", {
            style: "currency",
            currency: "ZAR"
        });
    }

    function displayBooking(booking) {

        document.getElementById("booking-number").textContent =
            booking.bookingNumber;

        document.getElementById("booking-status").textContent =
            booking.status;

        document.getElementById("customer-name").textContent =
            booking.customerName || "Not available";

        document.getElementById("customer-phone").textContent =
            booking.phone || "Not available";

        document.getElementById("customer-email").textContent =
            booking.email || "Not provided";

        document.getElementById("booking-date").textContent =
            formatDate(booking.createdAt);

        document.getElementById("booking-status-detail").textContent =
            booking.status;

        const itemsContainer =
            document.getElementById("booking-items");

        itemsContainer.innerHTML = "";

        let total = 0;

        booking.items.forEach(function (item) {

            const itemTotal = item.quantity * Number(item.unitPrice);

            total += itemTotal;

            const itemRow = document.createElement("div");
            itemRow.classList.add("booking-item-row");

            const itemName = document.createElement("span");
            itemName.textContent =
                item.itemName + " × " + item.quantity;

            const itemPrice = document.createElement("span");
            itemPrice.textContent = formatCurrency(itemTotal);

            itemRow.appendChild(itemName);
            itemRow.appendChild(itemPrice);

            itemsContainer.appendChild(itemRow);
        });

        const totalRow = document.createElement("div");
        totalRow.classList.add("booking-total-row");

        const totalLabel = document.createElement("strong");
        totalLabel.textContent = "Estimated Booking Total";

        const totalAmount = document.createElement("strong");
        totalAmount.textContent = formatCurrency(total);

        totalRow.appendChild(totalLabel);
        totalRow.appendChild(totalAmount);

        itemsContainer.appendChild(totalRow);

        loading.style.display = "none";
        errorBox.style.display = "none";
        content.style.display = "block";
    }

    async function loadBooking() {

        if (!bookingNumber) {
            showError(
                "No Booking Number was provided. Please check your booking confirmation."
            );
            return;
        }

        try {

            const response = await fetch(
                "/api/bookings/" + encodeURIComponent(bookingNumber)
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(
                        "Booking not found. Please check your Booking Number."
                    );
                }

                throw new Error(
                    "Unable to retrieve your booking. Please try again."
                );
            }

            const booking = await response.json();

            displayBooking(booking);

        } catch (error) {

            showError(error.message);

        }
    }

    loadBooking();

});