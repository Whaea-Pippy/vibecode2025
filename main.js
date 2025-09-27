document.addEventListener('DOMContentLoaded', () => {
    // Select all elements with the class 'game-link'
    const gameLinks = document.querySelectorAll('.game-link');

    // Iterate over each game link and add a click event listener
    gameLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // Prevent the default action, which is important if the link is an anchor tag
            event.preventDefault();

            // Get the destination URL from the 'data-game' attribute
            const gameUrl = link.dataset.game;

            // Navigate to the specified game URL
            if (gameUrl) {
                window.location.href = gameUrl;
            }
        });
    });
});
