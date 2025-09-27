import { mazeThemes as themes } from './themes.js';

// DOM Elements
const themeSelection = document.getElementById('theme-selection');
const difficultySelection = document.getElementById('difficulty-selection');
const characterContainer = document.getElementById('character-container');
const numberButtonsContainer = document.getElementById('number-buttons');
const resultMessage = document.getElementById('result-message');
const playAgainBtn = document.getElementById('play-again-btn');

// Game State
let selectedTheme = 'everyone';
let difficulty = 'easy'; // 'easy', 'medium', or 'hard'
let correctCount = 0;

// --- Event Listeners ---
themeSelection.addEventListener('click', (e) => {
    if (e.target.classList.contains('theme-btn')) {
        selectedTheme = e.target.dataset.theme;
        document.querySelectorAll('#theme-selection .theme-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        startGame();
    }
});

difficultySelection.addEventListener('click', (e) => {
    if (e.target.classList.contains('difficulty-btn')) {
        difficulty = e.target.dataset.difficulty;
        document.querySelectorAll('#difficulty-selection .difficulty-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        startGame();
    }
});

playAgainBtn.addEventListener('click', startGame);

// --- Game Logic ---

function startGame() {
    // 1. Reset the UI
    characterContainer.innerHTML = '';
    numberButtonsContainer.innerHTML = '';
    resultMessage.textContent = '';
    resultMessage.className = '';
    playAgainBtn.classList.add('hidden');

    // 2. Set difficulty class on container for styling
    characterContainer.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard');
    characterContainer.classList.add(`difficulty-${difficulty}`);

    // 3. Determine the range of numbers based on difficulty
    let minCount, maxCount;
    switch (difficulty) {
        case 'medium':
            minCount = 7;
            maxCount = 11;
            break;
        case 'hard':
            minCount = 0;
            maxCount = 20;
            break;
        case 'easy':
        default:
            minCount = 1;
            maxCount = 6;
            break;
    }
    correctCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;

    // 4. Get characters for the selected theme
    const characterSet = themes[selectedTheme]?.characters || themes.everyone.characters;
    const charactersToShow = [];

    // Build the array up to the correctCount, repeating characters if necessary
    for (let i = 0; i < correctCount; i++) {
        charactersToShow.push(characterSet[i % characterSet.length]);
    }

    // Shuffle the final array for randomness
    const finalShuffledCharacters = shuffleArray(charactersToShow);

    // 5. Display the characters
    finalShuffledCharacters.forEach((char, index) => {
        const img = document.createElement('img');
        img.src = char.image;
        img.alt = char.name;
        img.className = 'character-img';
        img.style.animationDelay = `${index * 100}ms`;
        characterContainer.appendChild(img);
    });

    // 6. Create and display number buttons
    for (let i = minCount; i <= maxCount; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = 'number-btn';
        button.addEventListener('click', () => checkAnswer(i, button));
        numberButtonsContainer.appendChild(button);
    }
}

function checkAnswer(selectedNumber, buttonElement) {
    if (selectedNumber === correctCount) {
        resultMessage.textContent = `YES - THERE ARE ${correctCount} READY TO PLAY!`;
        resultMessage.className = 'correct';
        playAgainBtn.classList.remove('hidden');
        numberButtonsContainer.innerHTML = ''; // Clear buttons on correct answer
        triggerCelebration(correctCount);
    } else {
        resultMessage.textContent = 'Try again!';
        resultMessage.className = 'incorrect';
        buttonElement.classList.add('shake');
        
        setTimeout(() => {
            buttonElement.classList.remove('shake');
            resultMessage.textContent = '';
            resultMessage.className = '';
        }, 800);
    }
}

function triggerCelebration(count) {
    const maxCount = 20;
    const intensity = Math.max(0.5, count / maxCount);

    const particleCount = 150 * intensity;
    const spread = 70 * intensity;
    const ticks = 200;
    const gravity = 1;
    const decay = 0.94;
    const startVelocity = 30;
    const scalar = Math.pow(0.95, intensity);

    const confettiDefaults = {
        spread: 360,
        ticks: 50,
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['star'],
        colors: ['#FFD700', '#FF6347', '#32CD32', '#1E90FF']
    };

    // Stars burst
    confetti({
        ...confettiDefaults,
        particleCount: particleCount,
        scalar
    });

    // Confetti burst
    confetti({
        ...confettiDefaults,
        shapes: ['circle', 'square'],
        particleCount: particleCount * 0.75,
        scalar: scalar * 0.75
    });

    // Streamers
    confetti({
        particleCount: Math.floor(particleCount / 3),
        angle: 270,
        spread: spread,
        origin: { y: 0 },
        shapes: ['square'],
        ticks: ticks,
        gravity: gravity,
        decay: decay,
        startVelocity: startVelocity
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initial game start
startGame();
