// TODO: FINISH SEAT ELEMENTS

const chosenSeats = new Map();
const MAX_SEATS = 8;

document.addEventListener('DOMContentLoaded', () => {
    const url = new URL(location.href)
    const movieID = url.pathname.split('/').pop();
    document.querySelector('#show-view').addEventListener('click', (event) => {
        const dateBtn = event.target.closest('.date-btn');
        if (dateBtn) {
            const buttons = document.querySelectorAll('.date-btn');
            buttons.forEach(button => {
                button.classList.remove('active');
            });
            dateBtn.classList.add('active');
            getShows(movieID, dateBtn.dataset.date);
        }

        const showBtn = event.target.closest('.show-time');
        if (showBtn) {
            const buttons = document.querySelectorAll('.show-time');
            buttons.forEach(button => {
                button.classList.remove('active');
            });
            showBtn.classList.add('active');
            renderSeats(showBtn.id);
        }

        const seat = event.target.closest('.seat.available, seat.selected');
        if (seat) {
            const seatLabel = seat.dataset.label;
    
            if (chosenSeats.has(seatLabel)) {
                chosenSeats.delete(seatLabel);
                seat.classList.remove('selected');
            } else if (chosenSeats.size < MAX_SEATS) {
                chosenSeats.set(seatLabel, seat);
                seat.classList.add('selected');
            }

            updateSeatList();
        }

        const bookBtn = event.target.closest('#book-btn');
        if (bookBtn && chosenSeats.size !== 0) {
            event.preventDefault();
            showBookingDetails(bookBtn.dataset.show);
        }
    });

    showMovieInfo(movieID);
});


function updateSeatList() {
    const seatList = document.querySelector('#seat-list');
    const labels = [...chosenSeats.keys()];
    const isMapEmpty = chosenSeats.size === 0;
    seatList.innerHTML = isMapEmpty ? '' : `<strong>Seats:</strong> ${labels.join(', ')}`;
}

function getDates() {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
}

async function showMovieInfo(movieID) {
    
    try {

        const response = await fetch(`/api/movies/${movieID}`);

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error);
        }

        const { is_playing, movie_data } = await response.json();
        const movieContainer = document.createElement('div');
        movieContainer.className = 'movie-container';

        const poster = document.createElement('img');
        poster.src = movie_data.poster_url;

        const movieInfo = document.createElement('div');
        movieInfo.className = 'movie-info';
        movieInfo.innerHTML = `
            <h1>${movie_data.title}</h1>
            <p>Director: ${movie_data.director}</p>
            <p>Stars: ${movie_data.stars}</p>
            <p>Genre: ${movie_data.genre}</p>
            <p>Duration: ${ movie_data.duration } minutes</p>
            <p>Rating: ${movie_data.rating_avg}/5.00 (${movie_data.rating_count} Users)</p>
            <a href='${movie_data.trailer}' target='_blank' rel='noopener noreferrer'>Watch Trailer</a>`;

        movieContainer.append(poster, movieInfo);
        
        const synopsisEl = document.createElement('div');
        synopsisEl.className = 'synopsis';
        const synopsisH2 = document.createElement('h2');
        synopsisH2.textContent = 'Synopsis';
        const synopsisText = document.createElement('p');
        synopsisText.textContent = movie_data.synopsis;
        synopsisEl.append(synopsisH2, synopsisText);

        document.querySelector('#show-view').append(movieContainer, synopsisEl);

        if (is_playing) {
            const scheduleContainer = document.createElement('div');
            scheduleContainer.id = 'schedule-container';

            const scheduleHeader = document.createElement('h3');
            scheduleHeader.textContent = 'Show Schedule';

            const dateContainer = document.createElement('div');
            dateContainer.id = 'date-container';
            const dates = getDates();
        
            dates.forEach(date => {
                const dateEl = document.createElement('div');
                dateEl.className = 'date-btn';
                dateEl.dataset.date = date;
                dateEl.textContent = date.slice(-2);
                dateContainer.append(dateEl);
            });
            const showContainer = document.createElement('div');
            showContainer.id = 'show-container';
            const bookingContainer = document.createElement('div');
            bookingContainer.id = 'booking-container';

            scheduleContainer.append(scheduleHeader, dateContainer, showContainer, bookingContainer);
            document.querySelector('#show-view').append(scheduleContainer);
        }
        
    } catch(e) {
        console.error(e.error)
    }
}

async function getShows(movie, date) {
    
    const showContainer = document.querySelector('#show-container');
    document.querySelector('#booking-container').innerHTML = '';
    chosenSeats.clear();
    
    try {
        
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/shows/${movie}?date=${date || today}`)

        if (!response.ok) {
            const result = await response.json()
            throw new Error(result.error)
        }

        const shows = await response.json();
        const buffer = document.createElement('div');
        buffer.id = 'show-container';
        const time = document.createElement('p');
        time.id = 'time';
        time.textContent = 'Select Screening Time';
        buffer.append(time);
        
        shows.forEach(show => {
            const showEl = document.createElement('div');
            showEl.className = 'show-time';
            showEl.id = show.id;
            showEl.textContent = show.starts_at;
            buffer.append(showEl);
            showEl.onclick = () => {
                showEl.classList.toggle('active');
            };
        });

        showContainer.replaceWith(buffer);

    } catch(e) {
        console.error(e.error)
    }
}

async function renderSeats(showId) {
    
    const bookingContainer = document.querySelector('#booking-container');
    bookingContainer.innerHTML = '';
    const seatContainer = document.createElement('div');
    seatContainer.id = '#seat-container';

    const svgNS = 'http://www.w3.org/2000/svg';
    const seatSize = 40;
    const gap = 8;

    try {

        const response = await fetch(`/shows/${showId}/seats`);

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error);
        }

        const { seatMap, seatIds, reservedIds} = await response.json();

        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', seatMap[0].length * (seatSize + gap));
        svg.setAttribute('height', seatMap.length * (seatSize + gap));

        // TODO: FINISH SEAT ELEMENTS
        let id = 0
        seatMap.forEach((row, r) => {
            row.forEach((cell, c) => {
            if (cell === 1) {
                const circle = document.createElementNS(svgNS, 'circle');

                const x = c * (seatSize + gap) + seatSize / 2;
                const y = r * (seatSize + gap) + seatSize / 2;

                circle.setAttribute('cx', x);
                circle.setAttribute('cy', y);
                circle.setAttribute('r', seatSize / 2);

                circle.dataset.row = r;
                circle.dataset.col = c;
                circle.dataset.label = `${String.fromCharCode(65 + r)}${c + 1}`;
                circle.id = seatIds[id];
                if (reservedIds.includes(seatIds[id++])) {
                    circle.setAttribute('class', 'seat booked');
                } else {
                    circle.setAttribute('class', 'seat available');
                }

                svg.appendChild(circle);

                const label = document.createElementNS(svgNS, 'text');
                label.setAttribute('x', x);
                label.setAttribute('y', y + 4);
                label.setAttribute('text-anchor', 'middle'); 
                label.setAttribute('font-size', '15');
                label.setAttribute('fill', 'black');
                label.textContent = circle.dataset.label;

                svg.appendChild(label);
            }
            });
        });

        const screen = document.createElement('div');
        screen.id = 'screen';
        screen.textContent = 'SCREEN';

        const reservationInfo = document.createElement('div');
        reservationInfo.id = 'reservation-info';
        const bookBtn = document.createElement('a');
        bookBtn.id = 'book-btn';
        bookBtn.textContent = 'Book Tickets';
        bookBtn.dataset.show = showId;
        const seatList = document.createElement('span');
        seatList.id = 'seat-list';
        reservationInfo.append(seatList, bookBtn);

        seatContainer.append(svg);

        bookingContainer.append(screen, seatContainer, reservationInfo);

    } catch(err) {
        console.error(err);
    }
}

async function showBookingDetails(showId) {
    
    document.querySelector('#show-view').style.display = 'none';
    document.querySelector('#booking-view').style.display = 'block';

    try {

        const response = await fetch(`/shows/${showId}/details`);

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error);
        }

        const show = await response.json();
        console.log(show)

        const bookingDetails = document.createElement('div');
        bookingDetails.id = 'booking-details';
        bookingDetails.textContent = 'Booking Details';

        const poster = document.createElement('img');
        poster.src = show.poster_url;

        const date = new Date(show.date);
        const dateFormat = date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
        const labels = [...chosenSeats.keys()];
        const showDetails = document.createElement('div');
        showDetails.innerHTML = `
            <span><strong>${show.title}</strong></span>
            <span>${show.theater}</span>
            <span>Date: ${dateFormat}</span>
            <span>Showtime: ${show.starts_at}</span>
            <span><strong>Seats :</strong> ${labels.join(', ')}</span>`;
        bookingDetails.append(poster, showDetails);

        const priceBreakdown = document.createElement('div');
        priceBreakdown.id = 'price-breakdown'
        priceBreakdown.textContent = 'Price Breakdown';

        const ticketPrice = Number(show.price);
        const ticketTotal = ticketPrice * labels.length;
        const serviceFee = Number(show.fee);
        const finalTotal = ticketTotal + serviceFee;

        const priceEl = document.createElement('div');
        priceEl.innerHTML = `
        <span>${labels.length} x Ticket @ Rp${ticketPrice}</span>
        <span>Rp${ticketTotal}</span>`;
        const feeEl = document.createElement('div');
        feeEl.innerHTML = `
        <span>Service Fee</span>
        <span>Rp${serviceFee}</span>`;
        const totalEl = document.createElement('div');
        totalEl.innerHTML = `
        <span><strong>Total</strong></span>
        <span>Rp${finalTotal}</span>`;

        priceBreakdown.append(priceEl, feeEl, totalEl);

        const paymentContainer = document.createElement('div');
        paymentContainer.id = 'payment-container';
        paymentContainer.textContent = 'Payment Information';

        const paymentForm = document.createElement('form');
        paymentForm.id = 'payment-form';
        paymentForm.innerHTML = `
            <label for="card-number">Card Number</label>
            <input type="text" name="card-number" id="card-number" placeholder="1234 5678 9012 3456" required minlength="16" maxlength="16">
            <label for="expiry-date">Expiry Date</label>
            <input type="text" name="expiry-date" id="expiry-date" placeholder="MM/YYYY" required minlength="7" maxlenght"7">
            <label for="CVV">CVV</label>
            <input type="text" name="cvv" id="cvv" placeholder="123" required>
            <label for="name">Cardholder Name</label>
            <input type="text" name="name" id="cardholder-name" placeholder="John Doe" required>`;
        const paymentBtn = document.createElement('input');
        paymentBtn.id = 'confirm-payment';
        paymentBtn.type = 'submit';
        paymentBtn.value = 'Proceed Payment';
        paymentForm.append(paymentBtn);
        paymentContainer.append(paymentForm);

        document.querySelector('#booking-view').append(bookingDetails, priceBreakdown, paymentContainer);

        window.addEventListener('beforeunload', (event) => {
                event.preventDefault();
            });

        paymentBtn.onclick = async (event) => {
            event.preventDefault();

            const cardNumber = document.querySelector('#card-number').value;
            const expiryDate = document.querySelector('#expiry-date').value;
            const cvv = document.querySelector('#cvv').value;
            const cardholderName = document.querySelector('#cardholder-name').value;
            const seatIds = [...chosenSeats.values()].map(seat => seat.id);

            try {

                const response = await fetch(`/shows/${showId}/reserve`, {
                    method: 'POST',
                    body: JSON.stringify({cardNumber, expiryDate, cvv, cardholderName, seatIds})
                })

                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error);
                }

                console.log(result);

            } catch(err) {
                console.error(err)
            }
        }

    } catch(err) {
        console.error(err);
    }
}