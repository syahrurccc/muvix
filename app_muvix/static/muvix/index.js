document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#now-playing').addEventListener('click', () => viewMovies('playing'));
    document.querySelector('#coming-soon').addEventListener('click', () => viewMovies('soon'));

    viewMovies('playing');
})

async function viewMovies(type) {

    const isPlayingView = type === 'playing';
    
    document.querySelector('#now-playing-view').innerHTML = '';
    document.querySelector('#coming-soon-view').innerHTML = '';

    try {

        const response = await fetch(`/movies/${type}`);

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

            const bookBtn = document.createElement('a');
            bookBtn.className = 'book-btn'
            bookBtn.href = `/movies/${movie.id}`;

            movieCard.append(poster, bookBtn);
            movieContainer.append(movieCard);
        });

        document.querySelector(isPlayingView ? '#now-playing-view' : 'coming-soon-view').append(movieContainer);

    } catch(error) {

    }

}