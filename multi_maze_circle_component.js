class MultiMazeCircle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.settings = { rings: 5, innerRadiusRatio: 0.2 };
        this.gameState = { grid: [], player: { ring: 0, cell: 0 }, trail: [], isDragging: false };
        this.imageCache = new Map();
        this.resizeObserver = null;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; width: 100%; height: 100%; touch-action: none; }
                canvas { display: block; width: 100%; height: 100%; border-radius: 50%; box-shadow: 0 5px 25px rgba(0,0,0,0.15); }
                #win-modal-container { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 100; }
                #win-modal-content { background: white; padding: 30px 50px; border-radius: 15px; text-align: center; box-shadow: 0 10px 20px rgba(0,0,0,0.2); animation: modal-appear 0.3s ease; }
                @keyframes modal-appear { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            </style>
            <canvas></canvas>
        `;
        this.canvas = this.shadowRoot.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) this.adjustCanvasSize(entry.contentRect);
        });
        this.resizeObserver.observe(this.canvas);

        this.setupInteractionListeners();
    }

    disconnectedCallback() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
    }
    
    adjustCanvasSize(rect) {
        const size = Math.min(rect.width, rect.height);
        if (this.canvas.width !== size || this.canvas.height !== size) {
            this.canvas.width = size;
            this.canvas.height = size;
            if (this.gameState.grid.length > 0) this.drawAll();
        }
    }

    async setTheme(theme) {
        this.theme = theme;
        await this.preloadImages();
        this.setupLayerControls();
        this.setLayers(this.settings.rings);
    }

    preloadImages() {
        return Promise.all(this.theme.characters.map(char => new Promise((resolve, reject) => {
            if (this.imageCache.has(char.image)) return resolve();
            const img = new Image();
            img.src = char.image;
            img.onload = () => { this.imageCache.set(char.image, img); resolve(); };
            img.onerror = reject;
        })));
    }

    setupLayerControls() {
        [4, 5, 6].forEach(num => {
            const btn = document.getElementById(`layers-${num}`);
            if (btn) btn.onclick = () => this.setLayers(num);
        });
    }

    setLayers(numLayers) {
        this.settings.rings = numLayers;
        document.querySelectorAll('#circle-layer-selection .control-button').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`layers-${numLayers}`);
        if (activeBtn) activeBtn.classList.add('active');
        this.startGame();
    }

    startGame() {
        if (this.winModal) this.winModal.remove();
        this.winModal = null;
        this.gameState = { grid: [], player: { ring: 0, cell: 0 }, trail: [], isDragging: false };
        this.shuffleCharacters();
        this.generateMaze();
        this.createCharacterSelectionUI();
        setTimeout(() => this.drawAll(), 0);
    }

    shuffleCharacters() {
        let characters = [...this.theme.characters];
        this.goalCharacter = characters.find(c => c.name === 'Marshall') || characters.pop();
        characters = characters.filter(c => c.name !== this.goalCharacter.name);
        const displayChars = new Set();
        while (displayChars.size < 6 && characters.length > 0) {
            displayChars.add(characters.splice(Math.floor(Math.random() * characters.length), 1)[0]);
        }
        this.displayCharacters = Array.from(displayChars);
        this.selectedCharacter = this.displayCharacters[0];
    }

    createCharacterSelectionUI() {
        const container = document.getElementById('circle-character-selection');
        if (!container) return;
        container.innerHTML = '';
        this.displayCharacters.forEach(char => {
            const img = document.createElement('img');
            img.src = char.image;
            img.classList.add('character-btn');
            if (this.selectedCharacter && char.name === this.selectedCharacter.name) img.classList.add('selected');
            img.onclick = () => {
                this.selectedCharacter = char;
                this.createCharacterSelectionUI();
                this.drawAll();
            };
            container.appendChild(img);
        });
    }

    generateMaze() {
        const rings = this.settings.rings;
        const gapWidth = rings === 6 ? 3 : 2;

        const grid = Array.from({ length: rings }, (_, r) => {
            const numCells = (r + 2) * 6;
            return Array.from({ length: numCells }, () => ({ walls: { E: false, S: true } }));
        });

        const gapPositions = [];
        let lastGapAngle = Math.random() * 2 * Math.PI;

        // --- PASS 1: Create Staggered Gaps ---
        for (let r = 0; r < rings - 1; r++) {
            const numCells = grid[r].length;
            const minOffset = Math.PI * 2 / 3; 
            lastGapAngle = (lastGapAngle + minOffset + (Math.random() * (Math.PI - minOffset))) % (2 * Math.PI);
            
            const gapStart = Math.floor((lastGapAngle / (2 * Math.PI)) * numCells);
            gapPositions.push(gapStart);

            for (let i = 0; i < gapWidth; i++) {
                const cellIndex = (gapStart + i) % numCells;
                grid[r][cellIndex].walls.S = false;
            }
        }

        // --- PASS 2: Place Strategic Barriers ---
        for (let r = 1; r < rings; r++) {
            const numCells = grid[r].length;
            const prevNumCells = grid[r - 1].length;

            const inGapStart = gapPositions[r - 1];
            const pathStart = Math.floor(inGapStart * (numCells / prevNumCells));
            
            let pathEnd;
            if (r < rings - 1) {
                pathEnd = gapPositions[r];
            } else {
                // For the outermost ring, the "out" gap is the random entry point.
                pathEnd = Math.floor(Math.random() * numCells);
            }

            let dist = Math.abs(pathEnd - pathStart);
            if (dist > numCells / 2) dist = numCells - dist;
            
            const barrierPos = (pathStart + Math.floor(dist / 2)) % numCells;
            grid[r][barrierPos].walls.E = true;
        }

        // --- Finalize Entry and Exit ---
        const entryCell = Math.floor(Math.random() * grid[rings-1].length);
        grid[rings-1][entryCell].isEntry = true;

        const exitGapCell = Math.floor(Math.random() * grid[0].length);
        grid[0][exitGapCell].walls.S = false;
        grid[0][exitGapCell].isExit = true;

        this.gameState.grid = grid;
        this.gameState.player = { ring: rings - 1, cell: entryCell };
        this.gameState.trail = [{...this.gameState.player}];
    }

    drawAll() {
        if (!this.ctx || this.canvas.width === 0) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.gameState.grid.length) return;
        this.drawMaze();
        this.drawTrail();
        this.drawGoal();
        this.drawPlayer();
    }
    
    drawMaze() {
        const { grid } = this.gameState;
        const { centerX, centerY } = this.getCanvasCenter();
        const { innerRadius, ringWidth, maxRadius } = this.getRadii();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2.5;
        this.ctx.lineCap = 'round';

        // Draw ring lines and radial walls
        for (let r = 0; r < grid.length; r++) {
            const ringRadius = innerRadius + (r + 1) * ringWidth;
            const numCells = grid[r].length;
            const cellAngle = (2 * Math.PI) / numCells;

            for (let c = 0; c < numCells; c++) {
                const startAngle = c * cellAngle;
                const endAngle = (c + 1) * cellAngle;
                
                // Draw radial walls (barriers)
                if (grid[r][c].walls.E) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(centerX + (ringRadius - ringWidth) * Math.cos(endAngle), centerY + (ringRadius - ringWidth) * Math.sin(endAngle));
                    this.ctx.lineTo(centerX + ringRadius * Math.cos(endAngle), centerY + ringRadius * Math.sin(endAngle));
                    this.ctx.stroke();
                }
                
                // Draw ring walls
                if (grid[r][c].walls.S) {
                     if (r < grid.length - 1) { // Only draw south walls for inner rings
                        this.ctx.beginPath();
                        this.ctx.arc(centerX, centerY, ringRadius, startAngle, endAngle);
                        this.ctx.stroke();
                    }
                }
            }
        }
        
        // Draw the main outer and inner circles
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, maxRadius, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
        this.ctx.stroke();


        // Erase entry and exit points
        const outerRing = grid[grid.length - 1];
        const outerCellAngle = (2 * Math.PI) / outerRing.length;
        const entryCellIndex = outerRing.findIndex(c => c.isEntry);
        if(entryCellIndex !== -1) {
            const entryStartAngle = entryCellIndex * outerCellAngle;
            const entryEndAngle = (entryCellIndex + 1) * outerCellAngle;
            this.eraseArc(centerX, centerY, maxRadius, entryStartAngle, entryEndAngle);
        }

        const innerRing = grid[0];
        const innerCellAngle = (2 * Math.PI) / innerRing.length;
        const exitCellIndex = innerRing.findIndex(c => c.isExit);
         if(exitCellIndex !== -1) {
            const exitStartAngle = exitCellIndex * innerCellAngle;
            const exitEndAngle = (exitCellIndex + 1) * innerCellAngle;
            this.eraseArc(centerX, centerY, innerRadius, exitStartAngle, exitEndAngle);
        }
    }

    eraseArc(x, y, radius, startAngle, endAngle) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, startAngle, endAngle);
        this.ctx.lineWidth = this.ctx.lineWidth + 2;
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawTrail() {
        if (this.gameState.trail.length < 2) return;
        this.ctx.lineCap = 'round';
        for (let i = 1; i < this.gameState.trail.length; i++) {
            const p1 = this.getCanvasCoords(this.gameState.trail[i - 1]);
            const p2 = this.getCanvasCoords(this.gameState.trail[i]);
            const hue = (i * 20) % 360;
            this.ctx.strokeStyle = `hsl(${hue}, 90%, 60%)`;
            this.ctx.lineWidth = this.getRadii().ringWidth * 0.4;
            this.ctx.beginPath(); this.ctx.moveTo(p1.x, p1.y); this.ctx.lineTo(p2.x, p2.y); this.ctx.stroke();
        }
    }

    drawPlayer() {
        if (!this.selectedCharacter) return;
        const center = this.getCanvasCoords(this.gameState.player);
        const size = this.getRadii().ringWidth * 0.8;
        const img = this.imageCache.get(this.selectedCharacter.image);
        if (img) this.drawImage(img, center.x, center.y, size);
    }

    drawGoal() {
        if (!this.goalCharacter) return;
        const { centerX, centerY } = this.getCanvasCenter();
        const size = this.getRadii().innerRadius * 1.6;
        const img = this.imageCache.get(this.goalCharacter.image);
        if (img) this.drawImage(img, centerX, centerY, size);
    }

    drawImage(img, x, y, size) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        this.ctx.clip();
        this.ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
        this.ctx.restore();
    }

    setupInteractionListeners() {
        this.canvas.addEventListener('mousedown', e => this.handleDragStart(e));
        this.canvas.addEventListener('mousemove', e => this.handleDragMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleDragEnd());
        this.canvas.addEventListener('mouseleave', () => this.handleDragEnd());
        this.canvas.addEventListener('touchstart', e => this.handleDragStart(e.touches[0]), { passive: false });
        this.canvas.addEventListener('touchmove', e => { e.preventDefault(); this.handleDragMove(e.touches[0]); }, { passive: false });
        this.canvas.addEventListener('touchend', () => this.handleDragEnd());
    }
    
    handleDragStart(e) {
        const pos = this.getEventPosition(e);
        const playerPos = this.getCanvasCoords(this.gameState.player);
        if (Math.hypot(pos.x - playerPos.x, pos.y - playerPos.y) < this.getRadii().ringWidth) {
            this.gameState.isDragging = true;
        }
    }

    handleDragMove(e) {
        if (!this.gameState.isDragging) return;
        const pos = this.getGridCoords(this.getEventPosition(e));
        if (pos.ring === this.gameState.player.ring && pos.cell === this.gameState.player.cell) return;

        if (this.isValidMove(this.gameState.player, pos)) {
            this.gameState.player = pos;
            
            const lastTrailPos = this.gameState.trail[this.gameState.trail.length - 1];
            if (pos.ring !== lastTrailPos.ring || pos.cell !== lastTrailPos.cell) {
                 this.gameState.trail.push(pos);
            }
            
            this.drawAll();
            
            if (this.gameState.player.ring === -1) { 
                 this.handleWin();
            }
        }
    }

    handleDragEnd() { this.gameState.isDragging = false; }
    
    handleWin(){
        this.gameState.isDragging = false;
        this.winModal = document.createElement('div');
        this.winModal.id = 'win-modal-container';
        this.winModal.innerHTML = `<div id="win-modal-content"><h2>You Win!</h2><p>Play Again?</p><button>Yes</button></div>`;
        this.winModal.querySelector('button').onclick = () => this.startGame();
        this.shadowRoot.appendChild(this.winModal);
    }

    getCanvasCenter = () => ({ centerX: this.canvas.width / 2, centerY: this.canvas.height / 2 });
    getRadii = () => {
        const maxRadius = this.canvas.width / 2 * 0.95;
        const innerRadius = maxRadius * this.settings.innerRadiusRatio;
        const ringWidth = (maxRadius - innerRadius) / this.settings.rings;
        return { innerRadius, ringWidth, maxRadius };
    };
    getEventPosition = (e) => ({ x: e.clientX - this.canvas.getBoundingClientRect().left, y: e.clientY - this.canvas.getBoundingClientRect().top });
    
    getGridCoords(pos) {
        const { centerX, centerY } = this.getCanvasCenter();
        const { innerRadius, ringWidth } = this.getRadii();
        const dx = pos.x - centerX; const dy = pos.y - centerY;
        const dist = Math.hypot(dx, dy);
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += 2 * Math.PI;
        
        if (dist < innerRadius) return { ring: -1, cell: -1 };

        let ring = Math.floor((dist - innerRadius) / ringWidth);
        ring = Math.max(0, Math.min(this.settings.rings - 1, ring));
        
        if (!this.gameState.grid[ring]) return { ring: this.gameState.player.ring, cell: this.gameState.player.cell };

        const numCells = this.gameState.grid[ring].length;
        let cell = Math.floor(angle * numCells / (2 * Math.PI));
        cell = Math.max(0, Math.min(numCells - 1, cell));

        return { ring, cell };
    }

    getCanvasCoords({ ring, cell }) {
        if (ring < 0) return this.getCanvasCenter();
        const { centerX, centerY } = this.getCanvasCenter();
        const { innerRadius, ringWidth } = this.getRadii();
        const ringRadius = innerRadius + (ring + 0.5) * ringWidth;
        
        if (!this.gameState.grid[ring]) return {x: centerX, y: centerY};
        const numCells = this.gameState.grid[ring].length;
        const angle = (cell + 0.5) * (2 * Math.PI) / numCells;
        return { x: centerX + ringRadius * Math.cos(angle), y: centerY + ringRadius * Math.sin(angle) };
    }

    isValidMove(from, to) {
        const { grid } = this.gameState;

        if (to.ring === -1) {
            return from.ring === 0 && grid[0][from.cell].isExit;
        }

        if (!grid[from.ring] || !grid[to.ring]) return false;

        if (from.ring === to.ring) {
            const numCells = grid[from.ring].length;
            const forwardMove = to.cell === (from.cell + 1) % numCells;
            const backwardMove = from.cell === (to.cell + 1) % numCells;

            if (forwardMove && !grid[from.ring][from.cell].walls.E) return true;
            if (backwardMove && !grid[from.ring][to.cell].walls.E) return true;
            
            if ((from.cell === numCells - 1 && to.cell === 0 && !grid[from.ring][from.cell].walls.E) || 
                (from.cell === 0 && to.cell === numCells - 1 && !grid[from.ring][to.cell].walls.E)) {
                return true;
            }
        }

        const isMovingIn = to.ring === from.ring - 1;
        const isMovingOut = to.ring === from.ring + 1;

        if (isMovingIn) {
            const scale = grid[from.ring].length / grid[to.ring].length;
            return Math.floor(from.cell / scale) === to.cell && !grid[to.ring][to.cell].walls.S;
        } else if (isMovingOut) {
            const scale = grid[to.ring].length / grid[from.ring].length;
            return Math.floor(to.cell / scale) === from.cell && !grid[from.ring][from.cell].walls.S;
        }

        return false;
    }
}
customElements.define('multi-maze-circle', MultiMazeCircle);
