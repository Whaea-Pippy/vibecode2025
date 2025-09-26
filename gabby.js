document.addEventListener('DOMContentLoaded', () => {
    const characters = ['cakey', 'catrat', 'djcatnip', 'gabby', 'kittyfairy', 'mercat', 'pandy'];
    const patternContainer = document.getElementById('pattern-container');
    const userInputContainer = document.getElementById('user-input-container');
    const characterSelectionContainer = document.getElementById('character-selection-container');
    const congratulationsContainer = document.getElementById('congratulations-container');
    const congratulationsMessage = document.getElementById('congratulations-message');
    const congratulationsImages = document.getElementById('congratulations-images');
    const btn2 = document.getElementById('btn-2');
    const btn3 = document.getElementById('btn-3');
    const btn4 = document.getElementById('btn-4');

    let pattern = [];
    let userPattern = [];
    let patternLength = 2;
    let numVisibleCells = 0;
    let selectedCharacter = null;

    function setupGame() {
        // 1. Clear previous game
        patternContainer.innerHTML = '';
        userInputContainer.innerHTML = '';
        characterSelectionContainer.innerHTML = '';
        congratulationsContainer.style.display = 'none';
        userPattern = [];
        selectedCharacter = null;

        // 2. Generate random pattern
        const patternCharacters = [...characters].sort(() => 0.5 - Math.random()).slice(0, patternLength);
        const repetitions = Math.floor(Math.random() * 2) + 2; // 2 or 3
        numVisibleCells = patternLength * repetitions;

        pattern = [];
        for (let i = 0; i < numVisibleCells + patternLength; i++) {
            pattern.push(patternCharacters[i % patternLength]);
        }

        // 3. Display pattern
        for (let i = 0; i < numVisibleCells; i++) {
            const patternCell = document.createElement('div');
            patternCell.classList.add('pattern-cell');
            const character = pattern[i];
            const imageUrl = `images/gabby/${character}.jpg`;
            const img = document.createElement('img');
            img.src = imageUrl;
            patternCell.appendChild(img);
            patternContainer.appendChild(patternCell);
        }

        // 4. Create user input slots
        for (let i = 0; i < patternLength; i++) {
            const userInputCell = document.createElement('div');
            userInputCell.classList.add('user-input-cell');
            userInputCell.dataset.index = i;
            userInputCell.addEventListener('click', () => handleCellClick(i, userInputCell));
            userInputCell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleCellClick(i, userInputCell);
            });
            userInputContainer.appendChild(userInputCell);
        }

        // 5. Display character selection
        characters.forEach(character => {
            const charImage = document.createElement('img');
            const imageUrl = `images/gabby/${character}.jpg`;
            charImage.src = imageUrl;
            charImage.alt = character;
            charImage.classList.add('character-image');
            charImage.draggable = true;

            charImage.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', character);
            });

            charImage.addEventListener('click', () => handleCharacterClick(character, charImage));
            charImage.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleCharacterClick(character, charImage);
            });

            characterSelectionContainer.appendChild(charImage);
        });

        // 6. Add drop listeners to user input cells
        const userInputCells = document.querySelectorAll('.user-input-cell');
        userInputCells.forEach(cell => {
            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                const character = e.dataTransfer.getData('text/plain');
                // Use currentTarget to ensure we get the DIV, not a child element
                const index = parseInt(e.currentTarget.dataset.index);
                handleDrop(character, index, e.currentTarget);
            });
        });
    }

    function handleCharacterClick(character, imgElement) {
        const currentlySelected = document.querySelector('.selected-char');
        if (currentlySelected) {
            currentlySelected.classList.remove('selected-char');
        }

        if (selectedCharacter !== character) {
            selectedCharacter = character;
            imgElement.classList.add('selected-char');
        } else {
            selectedCharacter = null; // Allow deselecting
        }
    }

    function handleCellClick(index, cell) {
        if (selectedCharacter && !cell.hasChildNodes()) {
            handleDrop(selectedCharacter, index, cell);
        }
    }

    function handleDrop(character, index, cell) {
        if (!cell || typeof index === 'undefined') return; // Exit if cell or index is invalid

        const correctCharacter = pattern[numVisibleCells + index];
        if (character === correctCharacter) {
            const imageUrl = `images/gabby/${character}.jpg`;
            const img = document.createElement('img');
            img.src = imageUrl;
            cell.innerHTML = ''; // Clear previous content
            cell.appendChild(img);
            cell.classList.add('correct');
            userPattern[index] = character;
            checkWin();
        } else {
             const currentlySelected = document.querySelector('.selected-char');
            if (currentlySelected) {
                currentlySelected.classList.remove('selected-char');
            }
            selectedCharacter = null;
        }

        const currentlySelected = document.querySelector('.selected-char');
        if (currentlySelected) {
            currentlySelected.classList.remove('selected-char');
        }
        selectedCharacter = null;
    }

    function checkWin() {
        if (userPattern.filter(c => c).length === patternLength) {
            congratulationsMessage.textContent = 'Congratulations!';
            congratulationsMessage.classList.add('rainbow-text');

            congratulationsImages.innerHTML = '';
            pattern.forEach(character => {
                const img = document.createElement('img');
                img.src = `images/gabby/${character}.jpg`;
                img.classList.add('congratulations-image');
                congratulationsImages.appendChild(img);
            });

            congratulationsContainer.style.display = 'block';

            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 }
            });
        }
    }

    btn2.addEventListener('click', () => { patternLength = 2; setupGame(); });
    btn3.addEventListener('click', () => { patternLength = 3; setupGame(); });
    btn4.addEventListener('click', () => { patternLength = 4; setupGame(); });

    setupGame();
});