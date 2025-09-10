import { showError } from "./base.js";

export async function viewMovies(type) {

    const isPlayingView = type === 'playing';
    
    document.querySelector('#now-playing-view').innerHTML = '';
    document.querySelector('#coming-soon-view').innerHTML = '';
    document.querySelector('#tickets-view').innerHTML = '';

    document.querySelector('#now-playing-view').style.display = isPlayingView ? 'block' : 'none';
    document.querySelector('#coming-soon-view').style.display = isPlayingView ? 'none' : 'block';
    document.querySelector('#tickets-view').style.display = 'none';

    try {

        const response = await fetch(`/api/movies/${type}`);

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error);
        }

        const movies = await response.json();
        console.log(movies);

        const homepageContainer = document.createElement('div');
        homepageContainer.id = 'homepage-container';

        const homepageHeader = document.createElement('div');
        homepageHeader.id = 'homepage-header';
        homepageHeader.innerHTML = `
            <h1>Book Your Tickets, Now!</h1>
            <h2>Cheap. Fast. Easy. Only on <span style="color: #E50914">Muvix</span>.</h2>`;
        
        const movieContainerLabel = document.createElement('h3');
        movieContainerLabel.id = 'movie-label';
        movieContainerLabel.textContent = isPlayingView ? 'Now Playing' : 'Coming Soon';

        const movieContainer = document.createElement('div');
        movieContainer.className = 'movie-container';
        
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';

            const poster = document.createElement('img');
            poster.className = 'poster';
            poster.src = movie.poster_url;
            poster.alt = `${movie.title} Poster`;

            const trailerBtn = document.createElement('a');
            trailerBtn.className = 'trailer-btn';
            trailerBtn.href = `${movie.trailer}`;
            trailerBtn.textContent = 'Watch Trailer';
            trailerBtn.target = '_blank';
            trailerBtn.rel = 'noopener noreferrer';

            const bookBtn = document.createElement('a');
            bookBtn.className = 'get-ticket';
            bookBtn.href = `/movies/${movie.id}`;
            bookBtn.textContent = isPlayingView ? 'Get Tickets' : 'See Details';

            movieCard.append(poster, trailerBtn, bookBtn);
            movieContainer.append(movieCard);
        });

        homepageContainer.append(homepageHeader, movieContainerLabel, movieContainer);
        document.querySelector(isPlayingView ? '#now-playing-view' : '#coming-soon-view').append(homepageContainer);

    } catch(err) {
        console.error(err);
        showError(err.message);
    }
}

export async function viewTickets() {
    
    document.querySelector('#now-playing-view').innerHTML = '';
    document.querySelector('#coming-soon-view').innerHTML = '';
    document.querySelector('#tickets-view').innerHTML = '';

    document.querySelector('#now-playing-view').style.display = 'none';
    document.querySelector('#coming-soon-view').style.display = 'none';
    document.querySelector('#tickets-view').style.display = 'block';

    try {

        const response = await fetch(`/api/tickets`);

        if (!response.ok) {
            const result = await response.json();
            if (result.redirect) {
                location.href = result.redirect;
            }
            throw new Error(result.error)
        }

        const reservations = await response.json();
        console.log(reservations);
        reservations.forEach(reservation => {
            const reservationContainer = document.createElement('div');
            reservationContainer.className = 'reservation-container';

            const poster = document.createElement('img');
            poster.className = 'reservation-poster';
            poster.src = reservation.show.poster_url;

            const date = new Date(reservation.show.date);
            const dateFormat = date.toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });
            const details = document.createElement('div');
            details.className = 'reservation-details';
            details.innerHTML = `
                <span><strong>${reservation.show.title}</strong></span>
                <span>${reservation.show.theater}</span>
                <span>Date: ${dateFormat}</span>
                <span>Showtime: ${reservation.show.starts_at}</span>
                <span><strong>Seats :</strong> ${reservation.seats.join(', ')}</span>
                <span class="view-qr">See QR Code</span>`;

            const qrcode = document.createElement('div');
            qrcode.classList.add('qrcode', 'hidden');
            new QRCode(qrcode, {
                text: reservation.ticket_code,
                width: 128,
                height: 128,
                correctLevel: QRCode.CorrectLevel.H
            });

            reservationContainer.append(poster, details, qrcode);
            document.querySelector('#tickets-view').append(reservationContainer);
        });

    } catch(err) {
        console.error(err);
        showError(err.message);
    }
}