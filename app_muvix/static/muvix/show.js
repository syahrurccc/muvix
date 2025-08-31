const chosenSeats = new Map();
const MAX_SEATS = 8;

document.addEventListener('DOMContentLoaded', () => {
    const url = new URL(location.href)
    const movieID = url.pathname.split("/").pop();
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
            renderSeats(showBtn.id, showBtn.dataset.theater);
        }

        const seat = event.target.closest('.seat.available, seat.selected');
        if (!seat) return;
        const seatId = seat.id;

        if (chosenSeats.has(seatId)) {
            chosenSeats.delete(seatId);
            seat.classList.remove('selected');
        } else if (chosenSeats.size < MAX_SEATS) {
            chosenSeats.set(seatId, seat);
            seat.classList.add('selected');
        }

        updateSeatList();
        console.log(chosenSeats);

    });

    showMovieInfo(movieID);
});


function updateSeatList() {
    
    const seatList = document.querySelector('#seat-list');
    if (seatList) {
        const labels = [...chosenSeats.keys()];
        seatList.innerHTML = `<strong>Seats:</strong> ${labels.join(', ')}`;
    }
}


function getDates() {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        dates.push(d.toISOString().split("T")[0]);
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
            <a href="${movie_data.trailer}" target="_blank" rel="noopener noreferrer">Watch Trailer</a>`;

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
            const seatContainer = document.createElement('div');
            seatContainer.id = 'seat-container';

            scheduleContainer.append(scheduleHeader, dateContainer, showContainer, seatContainer);
            document.querySelector('#show-view').append(scheduleContainer);
        }
        
    } catch(e) {
        console.error(e.error)
    }
}

async function getShows(movie, date) {
    
    const showContainer = document.querySelector('#show-container');
    showContainer.innerHTML = '';
    const seatContainer = document.querySelector('#seat-container');
    seatContainer.innerHTML = '';
    
    try {
        

        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(`/shows/${movie}?date=${date || today}`)

        if (!response.ok) {
            const result = await response.json()
            throw new Error(result.error)
        }

        const shows = await response.json()
        const time = document.createElement('p');
        time.id = 'time';
        time.textContent = 'Select Screening Time';
        showContainer.append(time);
        
        shows.forEach(show => {
            const showEl = document.createElement('div');
            showEl.className = 'show-time';
            showEl.id = show.id;
            showEl.dataset.theater = show.theater;
            showEl.textContent = show.starts_at;
            showContainer.append(showEl);
        });

        document.querySelector('#schedule-container').append(showContainer);

    } catch(e) {
        console.error(e.error)
    }
}

async function renderSeats(showId, theater) {

    const seatContainer = document.querySelector('#seat-container');
    seatContainer.innerHTML = '';

    const svgNS = "http://www.w3.org/2000/svg";
    const seatSize = 24;
    const gap = 8;

    try {

        const response = await fetch(`/shows/${showId}/seats`);

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error);
        }

        const seatMapJson = await response.json();
        const seatMap = seatMapJson.seat_map;
        console.log(seatMap)
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", seatMap[0].length * (seatSize + gap));
        svg.setAttribute("height", seatMap.length * (seatSize + gap));

        const seatRow = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        seatMap.forEach((row, r) => {
            row.forEach((cell, c) => {
            if (cell === 1) {
                const circle = document.createElementNS(svgNS, "circle");

                const x = c * (seatSize + gap) + seatSize / 2;
                const y = r * (seatSize + gap) + seatSize / 2;

                circle.setAttribute("cx", x);
                circle.setAttribute("cy", y);
                circle.setAttribute("r", seatSize / 2);

                circle.setAttribute("class", "seat available");
                circle.dataset.row = r;
                circle.dataset.col = c;
                circle.id = `${seatRow[r]}${c+1}`

                svg.appendChild(circle);
            }
            });
        });

        const reservationInfo = document.createElement('div');
        reservationInfo.id = 'reservation-info';
        const bookBtn = document.createElement('a');
        bookBtn.id = 'book-btn';
        bookBtn.textContent = 'Book Tickets';
        bookBtn.dataset.theater = theater;
        const seatList = document.createElement('span');
        seatList.id = 'seat-list';
        reservationInfo.append(seatList, bookBtn);

        seatContainer.append(svg);

        document.querySelector('#show-view').append(seatContainer, reservationInfo);

    } catch(err) {
        console.error(err);
    }
}


async function reserveSeat(showId, theater) {
    
    try {

        const response = await fetch(`/shows/movie/${showId}/seats`);

    } catch(err) {
        console.error(err);
    }
}