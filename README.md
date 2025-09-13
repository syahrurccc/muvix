# Muvix — Movie Ticket Booking App
### Overview
Muvix is a web application I built as my final project for CS50 Web Programming with Python and JavaScript. It is a full-stack movie ticket booking platform created with Django, SQLite, and vanilla JavaScript. Users can explore movies, watch trailers, filter showtimes, and select seats through an interactive SVG seat map. Reservations are stored in a relational database, and seat availability is managed to prevent double bookings. A simple payment flow lets users reserve up to 8 seats, with client-side and navigation guards to avoid accidental reloads during checkout. Each confirmed reservation generates a secure QR code (using Django signing + QRCode.js) for easy ticket validation without storing static files.

## Content
- [Distinctiveness and Complexity](#distinctiveness-and-complexity)
- [What's Inside?](#whats-inside)
- [Key Features](#features)
- [Design Choices](#design-choices)
- [How to Use](#how-to-use)

## Distinctiveness and Complexity
This project is distinct from the e-commerce (Project 2) and social network (Project 4) assignments in several important ways. While it shares the idea of user interaction and reservations, the design, models, and workflows are fundamentally different:

- **Not an e-commerce site:**\
Unlike a generic shopping cart, the booking system does not simply list items for sale. Instead, it manages time-sensitive seat reservations for specific movie showtimes, where availability must be enforced in real time. Each reservation is tied to a specific Show and Seat, with database constraints preventing double bookings. This is a scheduling and allocation problem rather than an inventory/checkout problem.
- **Not a social network:**\
There are no feeds, posts, likes, or friend relationships. Users do not interact socially. Instead, the focus is on backend logic for booking, time filtering, and validation, along with an interactive seat selection frontend.

This project also goes beyond the course assignments by combining advanced backend modeling with dynamic frontend interactions. The system manages multiple related models (Movie, Show, Theater, Reservation, ReservedSeat) and enforces seat uniqueness with database constraints. It includes an interactive SVG seat map built from 2D array layouts, and real-time seat selection with API updates. The frontend uses modular JavaScript with fetch, event delegation, and history state management to simulate SPA-like behavior. Finally, each reservation generates a secure signed ticket code, displayed as a QR code in the browser, and the payment flow is protected with navigation guards to prevent accidental reloads or back navigation.

## What's Inside?
### Python/Django
- **views.py :** Containing views and APIs for the web app.
- **models.py :** Containing models used for the database.
- **urls.py :** Containing urls for pages and APIs.
### JavaScript
- **auth.js :** Containing a small script to hide navbar elements.
- **base.js :** Base script that's loaded on every page to control navigations.
- **index.js :** Containing functions that populate homepage contents and behaviors.
- **show.js :** Containing functions that populate movie and payment page contents and behaviors.
### HTML/CSS
- **layout.html :** The base template for all pages on the web.
- **index.html :** Containing container divs for the homepage like Now Playing, Coming Soon, and Tickets.
- **show.html :** Containing container divs for movie and payment page.
- **login.html and register.html :** Containing elements for login and register page.
- **auth.css :** Stylings for the login and register page.
- **index.css :** Stylings for the homepage and tickets page.
- **show.css :** Stylings for the movie and payment page.

## Features
### User accounts
- Register and log in securely.
- View all reservations made with your account.
### Movies
- Browse Now Playing and Coming Soon categories.
- See posters, titles, duration, and synopsis.
- Watch trailers in a new tab.
### Showtimes and booking
- Pick a movie and see available showtimes for the next seven days.
- Interactive seat map built with SVG, including aisles.
- Click to select/deselect seats, up to 8 per reservation.
- Real-time seat availability updates.
### Reservations and tickets
- Reserve seats for a show and get a booking confirmation.
- Tickets include the movie details, showtime, selected seats, and a QR code generated instantly in the browser (no file storage needed).
- A price breakdown is displayed (ticket cost × quantity + service fee).
- Users can only see their own reservations, filtered so that expired shows (more than 2 hours past start time) don’t appear.
### Payment flow
- A simple card form simulates the checkout process.
- Reloading or hitting the back button during payment shows a confirmation to avoid losing progress.
- After a successful payment, users are redirected to the My Tickets page.

## Design Choices
### Splitting Date and Time in Show
- Instead of a single DateTimeField, a DateField and a TimeField is used.
- **Why:** This makes it easy to filter shows by date (show__date=today) and still handle multiple showtimes in one day. It also simplifies building the date navigation bar in the UI.
- **Trade-off:** When needing “real datetime math” (like “show hasn’t started 2 hours ago”), date and starts_at have to be combined manually using Q filters. If single DateTimeField is used, those queries would be simpler. On the other hand, keeping them split makes the data model clearer for theaters that schedule multiple times per day.
### select_related & prefetch_related
- Added select_related('show', 'show__movie', 'show__theater') for one-to-one / foreign key relationships, and prefetch_related('reserved_seats') for reverse foreign key relationships.
- **Why:** Prevents the N+1 query problem when serializing reservations with their show, movie, theater, and seats.
- **Trade-off:** Slightly larger queries, but massively fewer database hits overall. Better for scalability and performance.
### Seat Maps with SVG
- Seat layouts are represented as a 2D array in the Theater model (with 1 = seat, 0 = aisle).
- The frontend dynamically draws seats as SVG circles, which makes them interactive and scalable.
- **Why:** SVG is perfect for clickable, resolution-independent graphics like seat maps. No external dependency needed.
### QR Code Tickets
- Instead of storing images, each reservation gets a signed code using Django’s signing.dumps.
- On the frontend, QRCode.js generates the QR image on the fly.
- **Why:** Saves storage space, avoids serving static images for each ticket, and ensures security (codes can be verified server-side).
- **Trade-off:** Requires JavaScript to render QR codes in the browser. For sending tickets by email or generate PDFs, a server-side QR generator would be better.
### Navigation Guards for Payment
- During payment, beforeunload (reload/close warning) and a popstate confirm (back button trap) is added.
- **Why:** Prevents users from accidentally leaving the page mid-payment.

## How to Use
**1. Clone the repository**
```sh
git clone https://github.com/syahrurccc/muvix.git
cd muvix
```
**2. Install dependencies**
```sh
pip install -r requirements.txt
```
**3. Run database migrations**
```sh
python manage.py migrate
```
**4. Start the server**
```sh
python manage.py runserver
```
**5. Open http://127.0.0.1:8000/ in your browser.**