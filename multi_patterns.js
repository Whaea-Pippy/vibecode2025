import { mazeThemes as themes } from './themes.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const themeSelectionContainer = document.getElementById('theme-selection');
    const difficultySelectionContainer = document.getElementById('difficulty-selection');
    const patternContainer = document.getElementById('pattern-container');
    const characterSelectionContainer = document.getElementById('character-selection-container');
    const congratulationsContainer = document.getElementById('congratulations-container');
    const congratulationsMessage = document.getElementById('congratulations-message');
    const congratulationsImages = document.getElementById('congratulations-images');

    // --- Game State ---
    let selectedTheme = 'everyone';
    let patternLength = 2;
    let currentPattern = [];
    let userPattern = [];
    let numVisibleCells = 0;
    const numInputCells = 3; // ALWAYS expect 3 user inputs
    let selectedCharacterForInput = null;

    // --- Event Listeners ---

    themeSelectionContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('theme-btn')) {
            selectedTheme = e.target.dataset.theme;
            document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            setupGame();
        }
    });

    difficultySelectionContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('difficulty-btn')) {
            patternLength = parseInt(e.target.dataset.length, 10);
            document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            setupGame();
        }
    });

    // --- Game Logic ---

    function setupGame() {
        // 1. Clear previous game state
        patternContainer.innerHTML = '';
        characterSelectionContainer.innerHTML = '';
        congratulationsContainer.style.display = 'none';
        userPattern = [];
        selectedCharacterForInput = null;

        const characterSet = themes[selectedTheme].characters;

        // 2. Generate random pattern
        const patternCharacters = [...characterSet].sort(() => 0.5 - Math.random()).slice(0, patternLength);
        const repetitions = 2;
        numVisibleCells = patternLength * repetitions;

        currentPattern = [];
        // Ensure the currentPattern is long enough to check against the 3 input cells
        for (let i = 0; i < numVisibleCells + numInputCells; i++) {
            currentPattern.push(patternCharacters[i % patternLength]);
        }

        // 3. Display pattern
        for (let i = 0; i < numVisibleCells; i++) {
            const patternCell = document.createElement('div');
            patternCell.classList.add('pattern-cell');
            const character = currentPattern[i];
            const img = document.createElement('img');
            img.src = character.image;
            img.alt = character.name;
            patternCell.appendChild(img);
            patternContainer.appendChild(patternCell);
        }

        // 4. Create user input slots (ALWAYS 3)
        for (let i = 0; i < numInputCells; i++) {
            const userInputCell = document.createElement('div');
            userInputCell.classList.add('user-input-cell');
            userInputCell.dataset.index = i;
            
            userInputCell.addEventListener('click', () => handleCellClick(i, userInputCell));
            userInputCell.addEventListener('dragover', (e) => e.preventDefault());
            userInputCell.addEventListener('drop', (e) => {
                e.preventDefault();
                const characterName = e.dataTransfer.getData('text/plain');
                const character = characterSet.find(c => c.name === characterName);
                handleDrop(character, i, userInputCell);
            });

            patternContainer.appendChild(userInputCell);
        }

        // 5. Display character selection
        characterSet.forEach(character => {
            const charImage = document.createElement('img');
            charImage.src = character.image;
            charImage.alt = character.name;
            charImage.classList.add('character-image');
            
            charImage.draggable = true;
            charImage.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', character.name);
            });

            charImage.addEventListener('click', () => handleCharacterClick(character, charImage));

            characterSelectionContainer.appendChild(charImage);
        });
    }

    function handleCharacterClick(character, imgElement) {
        const currentlySelected = document.querySelector('.selected-char');
        if (currentlySelected) {
            currentlySelected.classList.remove('selected-char');
        }
        if (selectedCharacterForInput !== character) {
            selectedCharacterForInput = character;
            imgElement.classList.add('selected-char');
        } else {
            selectedCharacterForInput = null;
        }
    }

    function handleCellClick(index, cell) {
        if (selectedCharacterForInput && !cell.hasChildNodes()) {
            handleDrop(selectedCharacterForInput, index, cell);
        }
    }

    function handleDrop(character, index, cell) {
        if (!character || !cell || typeof index === 'undefined') return;

        const correctCharacter = currentPattern[numVisibleCells + index];

        if (character.name === correctCharacter.name) {
            const img = document.createElement('img');
            img.src = character.image;
            cell.innerHTML = '';
            cell.appendChild(img);
            cell.classList.add('correct');
            userPattern[index] = character;
            checkWin();
        } 

        const currentlySelected = document.querySelector('.selected-char');
        if (currentlySelected) {
            currentlySelected.classList.remove('selected-char');
        }
        selectedCharacterForInput = null;
    }

    function checkWin() {
        // Check if all 3 input cells are filled correctly
        if (userPattern.filter(c => c).length === numInputCells) {
            congratulationsMessage.textContent = 'Congratulations!';
            congratulationsContainer.style.display = 'block';

            congratulationsImages.innerHTML = '';
            // Display the 3 characters the user correctly entered
            userPattern.forEach(character => {
                const img = document.createElement('img');
                img.src = character.image;
                img.classList.add('congratulations-image');
                congratulationsImages.appendChild(img);
            });

            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 }
            });
        }
    }

    // --- Initial Game Setup ---
    setupGame();
});
