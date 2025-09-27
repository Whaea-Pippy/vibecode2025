import { mazeThemes } from './themes.js';

document.addEventListener('DOMContentLoaded', () => {
    const gameSelection = document.getElementById('game-selection');
    const gameCanvas = document.getElementById('game-canvas');
    const classicMazeGame = document.getElementById('classic-maze-game');
    const dynamicHeader = document.getElementById('dynamic-header');
    
    const everyoneMazeBtn = document.getElementById('everyone-maze-btn');
    const pawPatrolMazeBtn = document.getElementById('paw-patrol-maze-btn');
    const gabbyMazeBtn = document.getElementById('gabby-maze-btn');
    const zogMazeBtn = document.getElementById('zog-maze-btn');
    const backToSelectionBtn = document.getElementById('back-to-selection-btn');

    everyoneMazeBtn.addEventListener('click', () => {
        showGame('classic');
        setupMaze(mazeThemes.everyone);
    });

    pawPatrolMazeBtn.addEventListener('click', () => {
        showGame('classic');
        setupMaze(mazeThemes.pawPatrol);
    });

    gabbyMazeBtn.addEventListener('click', () => {
        showGame('classic');
        setupMaze(mazeThemes.gabby);
    });

    zogMazeBtn.addEventListener('click', () => {
        showGame('classic');
        setupMaze(mazeThemes.zog);
    });

    backToSelectionBtn.addEventListener('click', () => {
        gameSelection.classList.remove('hidden');
        gameCanvas.classList.add('hidden');
        classicMazeGame.classList.add('hidden');
    });

    function showGame(gameType) {
        gameSelection.classList.add('hidden');
        gameCanvas.classList.remove('hidden');
        classicMazeGame.classList.remove('hidden');
    }

    function setupMaze(theme) {
        const gameContainer = document.getElementById('game-container');
        const gameArea = document.getElementById('game-area');
        const winModal = document.getElementById('win-modal');
        const winMessage = document.getElementById('win-message');
        const characterImagesContainer = document.querySelector('.character-images');
        const dropdownBtn = document.getElementById('dropdown-btn');
        const dropdownContent = document.getElementById('dropdown-content');

        const allCharacters = theme.characters;
        let displayCharacters = [];
        let selectedCharacter;
        let goalCharacter;
        let maze, player, currentDifficulty = 8, playerPos, goalPos, visited, isMoving = false;
        let keydownHandler = null;
        let touchStartHandler = null;
        let touchMoveHandler = null;

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function createCharacterSelection() {
            const selectionContainer = document.getElementById('character-selection');
            selectionContainer.innerHTML = '';
            displayCharacters.forEach(character => {
                const img = document.createElement('img');
                img.src = character.image;
                img.alt = `Select ${character.name}`;
                img.classList.add('character-btn');
                if (selectedCharacter && character.name === selectedCharacter.name) {
                    img.classList.add('selected');
                }
                img.addEventListener('click', () => {
                    selectedCharacter = character;
                    if(player) player.src = selectedCharacter.image;
                    document.querySelectorAll('.character-btn').forEach(btn => btn.classList.remove('selected'));
                    img.classList.add('selected');
                    updateHeaderText();
                });
                selectionContainer.appendChild(img);
            });
        }
        
        function updateHeaderText() {
            if(selectedCharacter && goalCharacter) {
                dynamicHeader.textContent = `Guide ${selectedCharacter.name} to save ${goalCharacter.name}!`;
            }
        }

        function generateMaze(cols, rows) {
            const grid = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => ({ c, r, visited: false, walls: { top: true, right: true, bottom: true, left: true } })));
            const stack = [];
            let current = grid[Math.floor(rows / 2)][0];
            current.visited = true;
            do {
                const neighbors = [grid[current.r-1]?.[current.c], grid[current.r][current.c+1], grid[current.r+1]?.[current.c], grid[current.r][current.c-1]].filter(n => n && !n.visited);
                if (neighbors.length > 0) {
                    stack.push(current);
                    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                    if (next.r < current.r) { current.walls.top = false; next.walls.bottom = false; }
                    else if (next.c > current.c) { current.walls.right = false; next.walls.left = false; }
                    else if (next.r > current.r) { current.walls.bottom = false; next.walls.top = false; }
                    else if (next.c < current.c) { current.walls.left = false; next.walls.right = false; }
                    current = next;
                    current.visited = true;
                } else if (stack.length > 0) { current = stack.pop(); }
            } while (stack.length > 0);
            return grid;
        }

        function drawMaze() {
            gameContainer.style.gridTemplateColumns = `repeat(${currentDifficulty}, 1fr)`;
            gameContainer.innerHTML = '';
            maze.flat().forEach(cellData => {
                const cell = document.createElement('div');
                cell.className = 'cell';
                if (cellData.walls.top) cell.classList.add('wall-top');
                if (cellData.walls.right) cell.classList.add('wall-right');
                if (cellData.walls.bottom) cell.classList.add('wall-bottom');
                if (cellData.walls.left) cell.classList.add('wall-left');
                gameContainer.appendChild(cell);
            });
            const startCellIndex = playerPos.y * currentDifficulty + playerPos.x;
            const goalCellIndex = goalPos.y * currentDifficulty + goalPos.x;
            gameContainer.children[startCellIndex].classList.add('start-cell');
            gameContainer.children[goalCellIndex].classList.add('goal-cell');
            
            if(!player) {
                player = document.createElement('img');
                player.id = 'player';
            }
            gameContainer.append(player);
            player.src = selectedCharacter.image;
            resizeAndPositionElements();
        }

        function resizeAndPositionElements() {
            if (!gameContainer.firstChild || !gameArea) return;

            const availableWidth = gameArea.clientWidth;
            const availableHeight = gameArea.clientHeight;
            const size = Math.min(availableWidth, availableHeight) * 0.95; 

            gameContainer.style.width = `${size}px`;
            gameContainer.style.height = `${size}px`;
            
            const cellSize = size / currentDifficulty;
            const playerSize = cellSize * 0.8;

            if (player) {
                player.style.width = `${playerSize}px`;
                player.style.height = `${playerSize}px`;
                player.style.transform = `translate(${playerPos.x * cellSize + (cellSize - playerSize) / 2}px, ${playerPos.y * cellSize + (cellSize - playerSize) / 2}px)`;
            }
            updateTrace();
        }

        function updateTrace() {
            visited.forEach((pos, i) => {
                const index = pos.y * currentDifficulty + pos.x;
                const cell = gameContainer.children[index];
                if(cell && !cell.classList.contains('goal-cell') && !cell.classList.contains('start-cell')) {
                    const hue = (i * 20) % 360;
                    cell.style.backgroundColor = `hsl(${hue}, 90%, 70%)`;
                }
            });
        }

        function startGame(size, resetCharacters = true) {
            currentDifficulty = size;
            document.querySelectorAll('.control-button.active').forEach(btn => btn.classList.remove('active'));
            const difficulty = size === 8 ? 'easy' : size === 12 ? 'medium' : 'hard';
            document.getElementById(`${difficulty}-btn-dropdown`).classList.add('active');
            document.getElementById(`${difficulty}-btn-side`).classList.add('active');
            
            if (resetCharacters) {
                const shuffled = shuffleArray([...allCharacters]);
                goalCharacter = shuffled.pop(); 
                displayCharacters = shuffled.slice(0, 6);
                
                if (!selectedCharacter || !displayCharacters.find(c => c.name === selectedCharacter.name)) {
                    selectedCharacter = displayCharacters[0];
                }
                 createCharacterSelection();
            }
            
            const goalCharacterImg = document.getElementById('goal-character');
            goalCharacterImg.src = goalCharacter.image;
            goalCharacterImg.alt = `${goalCharacter.name} End`;
            updateHeaderText();
            
            maze = generateMaze(size, size);
            playerPos = { x: 0, y: Math.floor(size / 2) };
            goalPos = { x: size - 1, y: Math.floor(size / 2) };
            maze[playerPos.y][0].walls.left = false;
            maze[goalPos.y][size - 1].walls.right = false;
            visited = [{...playerPos}];
            drawMaze();
             if (player) {
                player.src = selectedCharacter.image;
            }

            if (keydownHandler) {
                window.removeEventListener('keydown', keydownHandler);
            }
            if (touchStartHandler) {
                gameContainer.removeEventListener('touchstart', touchStartHandler);
            }
            if (touchMoveHandler) {
                gameContainer.removeEventListener('touchmove', touchMoveHandler);
            }

            keydownHandler = e => {
                const keyMap = { ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0] };
                if (keyMap[e.key]) {
                    const newX = playerPos.x + keyMap[e.key][0];
                    const newY = playerPos.y + keyMap[e.key][1];
                    moveTo(newX, newY);
                }
            };

            touchStartHandler = e => {
                e.preventDefault();
            };

            touchMoveHandler = e => {
                e.preventDefault();
                const touch = e.changedTouches[0];
                const mazeRect = gameContainer.getBoundingClientRect();
                const cellSize = mazeRect.width / currentDifficulty;
                const x = Math.floor((touch.clientX - mazeRect.left) / cellSize);
                const y = Math.floor((touch.clientY - mazeRect.top) / cellSize);
                if (x >= 0 && x < currentDifficulty && y >= 0 && y < currentDifficulty) {
                    moveTo(x, y);
                }
            };

            window.addEventListener('keydown', keydownHandler);
            gameContainer.addEventListener('touchstart', touchStartHandler, { passive: false });
            gameContainer.addEventListener('touchmove', touchMoveHandler, { passive: false });
        }

        function showWinModal() {
            winMessage.textContent = `${selectedCharacter.name} found ${goalCharacter.name}!`;
            characterImagesContainer.innerHTML = '';
            
            const playerImg = document.createElement('img');
            playerImg.src = selectedCharacter.image;
            playerImg.alt = selectedCharacter.name;
            characterImagesContainer.appendChild(playerImg);

            const goalImg = document.createElement('img');
            goalImg.src = goalCharacter.image;
            goalImg.alt = goalCharacter.name;
            characterImagesContainer.appendChild(goalImg);
            
            winModal.style.display = 'flex';
        }

        function moveTo(x, y) {
            if(isMoving) return;
            const dx = x - playerPos.x;
            const dy = y - playerPos.y;
            if (Math.abs(dx) + Math.abs(dy) !== 1) return;
            const currentCell = maze[playerPos.y][playerPos.x];
            let moved = false;
            if (dy === -1 && !currentCell.walls.top) { playerPos.y--; moved = true; }
            else if (dx === 1 && !currentCell.walls.right) { playerPos.x++; moved = true; }
            else if (dy === 1 && !currentCell.walls.bottom) { playerPos.y++; moved = true; }
            else if (dx === -1 && !currentCell.walls.left) { playerPos.x--; moved = true; }
            if (moved) {
                isMoving = true;
                if (!visited.some(p => p.x === playerPos.x && p.y === playerPos.y)) {
                    visited.push({ ...playerPos });
                }
                resizeAndPositionElements();
                if (playerPos.y === goalPos.y && playerPos.x === goalPos.x) {
                    setTimeout(showWinModal, 200);
                }
                setTimeout(() => isMoving = false, 50);
            }
        }

        if (dropdownBtn) {
            dropdownBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                dropdownContent.classList.toggle('show');
            });
        }

        window.addEventListener('click', (event) => {
            if (dropdownContent && !event.target.matches('#dropdown-btn')) {
                if (dropdownContent.classList.contains('show')) {
                    dropdownContent.classList.remove('show');
                }
            }
        });

        function handleControlClick(callback) {
            callback();
            if (dropdownContent && dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }

        ['easy', 'medium', 'hard'].forEach((difficulty, i) => {
            const size = [8, 12, 16][i];
            const dropdownButton = document.getElementById(`${difficulty}-btn-dropdown`);
            if (dropdownButton) {
                dropdownButton.addEventListener('click', () => handleControlClick(() => startGame(size)));
            }
            const sideButton = document.getElementById(`${difficulty}-btn-side`);
            if (sideButton) {
                sideButton.addEventListener('click', () => startGame(size));
            }
        });
        
        const resetDropdown = document.getElementById('reset-btn-dropdown');
        if (resetDropdown) {
            resetDropdown.addEventListener('click', () => handleControlClick(() => startGame(currentDifficulty)));
        }

        const resetSide = document.getElementById('reset-btn-side');
        if(resetSide){
            resetSide.addEventListener('click', () => startGame(currentDifficulty));
        }
        
        const playAgain = document.getElementById('play-again-btn');
        if(playAgain){
            playAgain.addEventListener('click', () => { winModal.style.display = 'none'; startGame(currentDifficulty); });
        }
        
        const resizeObserver = new ResizeObserver(resizeAndPositionElements);
        resizeObserver.observe(gameArea);

        window.addEventListener('resize', resizeAndPositionElements);
        
        startGame(currentDifficulty);
    }
});
