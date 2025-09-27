class CircleMaze extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.settings = { rings: 5, innerRadiusRatio: 0.2, defaultCharacter: null };
        this.gameState = { grid: [], player: { ring: 0, cell: 0 }, trail: [], isDragging: false };
        this.imageCache = new Map();
        this.resizeObserver = null;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; width: 100%; height: 100%; touch-action: none; }
                canvas { display: block; width: 100%; height: 100%; border-radius: 50%; box-shadow: 0 5px 25px rgba(0,0,0,0.15); }
                #win-modal-container {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background-color: rgba(0,0,0,0.7); display: flex;
                    justify-content: center; align-items: center; z-index: 100;
                }
                #win-modal-content {
                    background: white; padding: 30px 50px; border-radius: 15px;
                    text-align: center; box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                    animation: modal-appear 0.3s ease;
                }
                @keyframes modal-appear { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            </style>
            <canvas></canvas>
        `;
        this.canvas = this.shadowRoot.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                this.adjustCanvasSize(entry.contentRect);
            }
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
            // Only draw if a game is in progress
            if (this.gameState.grid.length > 0) {
                this.drawAll();
            }
        }
    }

    async setTheme(theme) {
        this.theme = theme;
        this.settings.defaultCharacter = theme.characters[0];
        await this.preloadImages();
        this.setupLayerControls();
        this.setLayers(this.settings.rings);
    }

    preloadImages() {
        const promises = this.theme.characters.map(char => {
            return new Promise((resolve, reject) => {
                if (this.imageCache.has(char.image)) return resolve();
                const img = new Image();
                img.src = char.image;
                img.onload = () => { this.imageCache.set(char.image, img); resolve(); };
                img.onerror = reject;
            });
        });
        return Promise.all(promises);
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
        if (this.winModal) {
            this.winModal.remove();
            this.winModal = null;
        }
        this.gameState = { grid: [], player: { ring: 0, cell: 0 }, trail: [], isDragging: false };
        this.shuffleCharacters();
        this.generateMaze();
        this.createCharacterSelectionUI();
        // A short delay to ensure canvas is sized before drawing
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
        const grid = Array.from({ length: rings }, (_, r) =>
            Array.from({ length: (r + 2) * 6 }, () => ({ walls: { E: true, S: true } }))
        );

        let walls = [];
        for (let r = 0; r < rings; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                walls.push({ r, c, dir: 'E' });
                if (r + 1 < rings) {
                    walls.push({ r, c, dir: 'S' });
                }
            }
        }
        
        for (let i = walls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [walls[i], walls[j]] = [walls[j], walls[i]];
        }
        
        const parent = new Map();
        const find = (id) => {
            if (!parent.has(id)) parent.set(id, id);
            if (parent.get(id) === id) return id;
            parent.set(id, find(parent.get(id)));
            return parent.get(id);
        };
        const union = (id1, id2) => {
            const root1 = find(id1);
            const root2 = find(id2);
            if (root1 !== root2) parent.set(root1, root2);
        };
        const cellId = (r, c) => `${r},${c}`;

        for (const wall of walls) {
            const { r, c, dir } = wall;
            const numCells = grid[r].length;
            let r1 = r, c1 = c, r2, c2;

            if (dir === 'E') {
                r2 = r;
                c2 = (c + 1) % numCells;
            } else { // dir === 'S'
                r2 = r + 1;
                const scale = grid[r2].length / numCells;
                c2 = Math.floor(c * scale) + Math.floor(Math.random() * scale);
            }
            
            if (find(cellId(r1, c1)) !== find(cellId(r2, c2))) {
                union(cellId(r1, c1), cellId(r2, c2));
                grid[r][c].walls[dir] = false;
            }
        }

        const entryCell = Math.floor(Math.random() * grid[rings-1].length);
        const exitCell = Math.floor(Math.random() * grid[0].length);
        grid[rings - 1][entryCell].isEntry = true;
        grid[0][exitCell].isExit = true;

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

        for (let r = 0; r < grid.length; r++) {
            const ringRadius = innerRadius + (r + 1) * ringWidth;
            const numCells = grid[r].length;
            const cellAngle = (2 * Math.PI) / numCells;

            for (let c = 0; c < numCells; c++) {
                const startAngle = c * cellAngle;
                const endAngle = (c + 1) * cellAngle;
                
                if (grid[r][c].walls.E) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(centerX + (ringRadius - ringWidth) * Math.cos(endAngle), centerY + (ringRadius - ringWidth) * Math.sin(endAngle));
                    this.ctx.lineTo(centerX + ringRadius * Math.cos(endAngle), centerY + ringRadius * Math.sin(endAngle));
                    this.ctx.stroke();
                }
                
                if (grid[r][c].walls.S) {
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, ringRadius, startAngle, endAngle);
                    this.ctx.stroke();
                }
            }
        }

        const outerRing = grid[grid.length - 1];
        const outerCellAngle = (2 * Math.PI) / outerRing.length;
        for (let c = 0; c < outerRing.length; c++) {
            if (!outerRing[c].isEntry) {
                 this.ctx.beginPath();
                 this.ctx.arc(centerX, centerY, maxRadius, c * outerCellAngle, (c + 1) * outerCellAngle);
                 this.ctx.stroke();
            }
        }
        
        const innerRing = grid[0];
        const innerCellAngle = (2 * Math.PI) / innerRing.length;
        for (let c = 0; c < innerRing.length; c++) {
            if(!innerRing[c].isExit) {
                 this.ctx.beginPath();
                 this.ctx.arc(centerX, centerY, innerRadius, c * innerCellAngle, (c+1) * innerCellAngle);
                 this.ctx.stroke();
            }
        }
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
            
            if (this.gameState.player.ring === 0 && this.gameState.grid[0][this.gameState.player.cell].isExit) {
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

    // Conversion and validation utilities
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
        
        if (dist < innerRadius) return { ring: -1, cell: -1 }; // Center goal area

        let ring = Math.floor((dist - innerRadius) / ringWidth);
        ring = Math.max(0, Math.min(this.settings.rings - 1, ring));
        
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
        if (!grid[from.ring] || (to.ring >= 0 && !grid[to.ring])) return false;

        // Check for exit condition
        if (to.ring === -1 && from.ring === 0 && grid[0][from.cell].isExit) return true;

        if (from.ring === to.ring) { // Same ring
            const numCells = grid[from.ring].length;
            if ((to.cell === (from.cell + 1) % numCells) && !grid[from.ring][from.cell].walls.E) return true;
            if ((from.cell === (to.cell + 1) % numCells) && !grid[from.ring][to.cell].walls.E) return true;
        } else if (to.ring === from.ring + 1) { // Moving Outward
             const scale = grid[to.ring].length / grid[from.ring].length;
             if (Math.floor(to.cell / scale) === from.cell && !grid[from.ring][from.cell].walls.S) return true;
        } else if (to.ring === from.ring - 1) { // Moving Inward
             const scale = grid[from.ring].length / grid[to.ring].length;
             if (Math.floor(from.cell / scale) === to.cell && !grid[to.ring][to.cell].walls.S) return true;
        }
        
        return false;
    }
}
customElements.define('circle-maze', CircleMaze);
