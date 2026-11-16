# Restaurant Management System

A full-stack restaurant management application developed using **Java, Spring Boot, MySQL, HTML, CSS and JavaScript**.

The system provides customers with an online menu and collection booking experience, while giving restaurant staff an administration dashboard to manage bookings, monitor collection progress and maintain menu items.

## Live Application

- **Customer Website:** https://restaurant-app-21d94.web.app

## Project Overview

The Restaurant Management System aims to improve restaurant operations through digital menu management and collection booking administration.

Customers can explore menu items, add selections to their cart and submit collection bookings. Restaurant staff can manage incoming bookings and monitor their progress through a centralised administration dashboard.

## Key Features

### Customer Website
- Interactive restaurant menu.
- Food categories and menu browsing.
- Menu search and filtering.
- Shopping cart functionality.
- Recommended meals and special selections.
- Collection booking submissions.
- Customer contact information.
- Special booking instructions.
- Booking confirmation and unique booking numbers.

### Administration Dashboard
- Booking statistics and completion rates.
- Real-time booking updates through automatic refreshing.
- Booking search and status filtering.
- Customer booking details.
- Customer special instructions.
- Booking status management.
- Visual booking progress indicators.

### Menu Management
- Create and manage menu items.
- Edit item information and pricing.
- Manage menu categories.
- Control item availability.
- Manage recommended items.
- Manage special meal selections.
- Remove menu items.

## Booking Workflow

The application supports the following booking statuses:

| Status | Description |
|---|---|
| BOOKED | Collection booking received. |
| ARRIVED | Customer has arrived. |
| PREPARING | Order preparation has started. |
| READY | Order is ready for collection. |
| COLLECTED | Order has been collected. |
| CANCELLED | Booking has been cancelled. |

**Booking lifecycle:**

`BOOKED → ARRIVED → PREPARING → READY → COLLECTED`

## Technologies

| Area | Technologies |
|---|---|
| Backend | Java, Spring Boot |
| Data Access | Spring Data JPA, Hibernate |
| Frontend | HTML5, CSS3, JavaScript |
| Database | MySQL |
| Build Tool | Maven |
| Hosting | Firebase Hosting, Render |
| Version Control | Git, GitHub |

## Deployment

The application uses separate hosting services:

- **Firebase Hosting:** Customer website and administration interface.
- **Render:** Spring Boot backend services.
- **MySQL:** Application database.

## Future Development

Planned enhancements include:
- Online payment integration.
- Customer delivery ordering.
- Delivery tracking.
- Customer order history.
- Advanced reporting and analytics.
- Enhanced authentication and access control.

## Project Status

Actively developed.

The current application focuses on customer collection bookings, restaurant menu management and administrative booking operations.

## Author

**Braidan Ngobeni**

Computer Science | Java | Spring Boot | Full-Stack Development

GitHub: [Braidan04](https://github.com/Braidan04)

---

## Copyright Notice

© 2026 Braidan Ngobeni. All Rights Reserved.

This project and its source code are the intellectual property of the author.

Public visibility of this repository is for portfolio presentation and viewing purposes only. No permission is granted to copy, reproduce, distribute, modify, or commercially use this project or its source code without prior written authorisation.
