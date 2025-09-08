import { viewMovies, viewTickets } from "./index.js";

document.addEventListener('DOMContentLoaded', () => {
    
    const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (onHomePage() && !tab) {
            viewMovies('playing');
        } else if (onHomePage() && tab) {
            const isMovieView = tab === 'playing' || tab === 'soon';
            isMovieView ? viewMovies(tab) : viewTickets();
        }
    
    document.addEventListener('click', (event) => {
        
        const navigation = event.target.closest('#now-playing, #coming-soon, #tickets');
        if (navigation) {
            // Prevent reload
            event.preventDefault();
            
            // Get clicked tab data and its href
            const tab = navigation.dataset.tab;
            const isMovieView = tab === 'playing' || tab === 'soon';
            const homeURL = navigation.getAttribute('href');
            
            if (onHomePage()) {
                isMovieView ? viewMovies(tab) : viewTickets();
                
                // Create new URL object using the current URL
                const url = new URL(location.href);
                // Set the tab parameter of the URL to tab const, create one if doesn't exist
                url.searchParams.set('tab', tab);
                // Replace the old URL with new URL without reloading and adding history
                history.replaceState(null, '', url.toString());
            } else {
                // Create URL object with the root of the URL, then add the homeURL
                const url = new URL(homeURL, location.origin);
                url.searchParams.set('tab', tab);
                // Open the new URL
                location.href = url.toString();
            }
        }

        const viewQR = event.target.closest('.view-qr');
        if (viewQR) {
            const container = viewQR.closest('.reservation-container');
            container.querySelector('.qrcode').classList.toggle('hidden');
        }
    });
});

function onHomePage() {
    // Return bool to check if on homepage or not
    return !!document.querySelector('#now-playing-view, #coming-soon-view');
}

export function showError(error) {

	const alert = document.createElement('div');

    alert.classList.add('alert', 'alert-danger');
	alert.setAttribute('role', 'alert');

	alert.textContent = error;

	document.querySelector('body').prepend(alert);
	alert.style.animationPlayState = 'running';

	setTimeout(() => alert.remove(), 3000);
}
