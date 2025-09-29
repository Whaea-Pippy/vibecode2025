import { mazeThemes } from '../themes.js';

document.addEventListener('DOMContentLoaded', () => {
    const mazeComponent = document.querySelector('maze-circle');

    if (mazeComponent) {
        // Set the initial theme when the page loads.
        // The component will then handle its own internal setup, including setting the default layer.
        mazeComponent.setTheme(mazeThemes.pawPatrol);
    } else {
        console.error('The maze-circle component was not found in the DOM.');
    }
});
