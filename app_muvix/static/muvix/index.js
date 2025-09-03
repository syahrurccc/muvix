export async function viewMovies(type) {

    const isPlayingView = type === 'playing';
    
    document.querySelector('#now-playing-view').innerHTML = '';
    document.querySelector('#coming-soon-view').innerHTML = '';

    document.querySelector('#now-playing-view').style.display = isPlayingView ? 'block' : 'none';
    document.querySelector('#coming-soon-view').style.display = isPlayingView ? 'none' : 'block';

    try {

        const response = await fetch(`/api/movies/${type}`);

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error);
        }

        const movies = await response.json();
        console.log(movies);

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
            bookBtn.id = 'get-ticket';
            bookBtn.href = `/movies/${movie.id}`;
            bookBtn.textContent = 'Get Ticket';

            movieCard.append(poster, trailerBtn, bookBtn);
            movieContainer.append(movieCard);
        });

        document.querySelector(isPlayingView ? '#now-playing-view' : '#coming-soon-view').append(movieContainer);

    } catch(error) {
        console.error(error)
    }
}