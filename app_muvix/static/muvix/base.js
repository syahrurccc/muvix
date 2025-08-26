import { viewMovies } from "./index.js";

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (event) => {
        const navigation = event.target.closest('#now-playing, #coming-soon');
        if (!navigation) return;
    
        event.preventDefault();
    
        const tab = navigation.dataset.page;
        const homeURL = navigation.getAttribute('href');
    
        if (onHomePage()) {
            viewMovies(tab);
    
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tab);
            history.replaceState(null, '', url.toString());
        } else {
            const url = new URL(homeURL, window.location.origin);
            url.searchParams.set('tab', tab);
            window.location.href = url.toString();
        }
    });

})

function onHomePage() {
    return !!document.querySelector('#now-playing-view, #coming-soon-view');
}
