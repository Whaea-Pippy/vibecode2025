import { mazeThemes } from './themes.js';

document.addEventListener('DOMContentLoaded', () => {
    const circleMazeComponent = document.querySelector('circle-maze');
    if (circleMazeComponent) {
        circleMazeComponent.setTheme(mazeThemes.everyone);
    }

    const layer4Btn = document.getElementById('layers-4');
    const layer5Btn = document.getElementById('layers-5');
    const layer6Btn = document.getElementById('layers-6');

    if (layer4Btn) {
        layer4Btn.addEventListener('click', () => {
            if (circleMazeComponent) {
                circleMazeComponent.setLayers(4);
            }
        });
    }

    if (layer5Btn) {
        layer5Btn.addEventListener('click', () => {
            if (circleMazeComponent) {
                circleMazeComponent.setLayers(5);
            }
        });
    }

    if (layer6Btn) {
        layer6Btn.addEventListener('click', () => {
            if (circleMazeComponent) {
                circleMazeComponent.setLayers(6);
            }
        });
    }
});
