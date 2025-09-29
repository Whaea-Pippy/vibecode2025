
class MazeCircle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.settings = { rings: 3, seed: Date.now() };
        this.gameState = { player: { ring: 0, cell: 0 }, trail: [], isDragging: false, isWon: false };
        this.mazeGeometry = { radii: [], gaps: [], barriers: [] };
        this.imageCache = new Map();
        this.resizeObserver = null;
        this.isInitialized = false;
        this.theme = null;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; width: 100%; height: 100%; touch-action: none; user-select: none; }
                canvas { display: block; width: 100%; height: 100%; border-radius: 50%; }
            </style>
            <canvas></canvas>
        `;
        this.canvas = this.shadowRoot.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.resizeObserver = new ResizeObserver(entries => this.handleResize(entries[0].contentRect));
        this.resizeObserver.observe(this);

        this.setupInteractionListeners();
    }

    disconnectedCallback() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
    }

    handleResize(rect) {
        const dpr = window.devicePixelRatio || 1;
        const size = Math.min(rect.width, rect.height);
        if (size === 0) return;

        const needsInitialization = !this.isInitialized;

        if (this.canvas.width !== size * dpr) {
            this.canvas.width = size * dpr;
            this.canvas.height = size * dpr;
            this.canvas.style.width = `${size}px`;
            this.canvas.style.height = `${size}px`;
            this.ctx.scale(dpr, dpr);
        }

        if (this.isInitialized) {
            this.startGame(false); // Redraw maze on resize
        } else if (needsInitialization && this.theme) {
            this.initialize();
        }
    }

    async setTheme(theme) {
        this.theme = theme;
        await this.preloadImages();
        this.setupControls();
        if (this.canvas.width > 0 && !this.isInitialized) {
            this.initialize();
        }
    }

    initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.setLayers(this.settings.rings);
    }

    preloadImages() {
        if (!this.theme || !this.theme.characters) return Promise.resolve();
        const characters = this.theme.characters.flatMap(c => [c.image, c.winImage].filter(Boolean));
        const uniqueImages = [...new Set(characters)];
        return Promise.all(uniqueImages.map(src => new Promise((resolve, reject) => {
            if (this.imageCache.has(src)) return resolve();
            const img = new Image();
            img.src = src;
            img.onload = () => { this.imageCache.set(src, img); resolve(); };
            img.onerror = () => reject(`Failed to load image: ${src}`);
        })));
    }

    setupControls() {
        [3, 4, 5, 6].forEach(num => {
            const btn = document.getElementById(`layers-${num}`);
            if (btn) btn.onclick = () => this.setLayers(num);
        });
        const newMazeBtn = document.getElementById('new-maze-btn');
        if(newMazeBtn) newMazeBtn.onclick = () => this.startGame(true);
    }

    setLayers(numLayers) {
        const newSeed = this.settings.rings !== numLayers;
        this.settings.rings = numLayers;

        document.querySelectorAll('#circle-layer-selection .control-button').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`layers-${numLayers}`);
        if(activeBtn) activeBtn.classList.add('active');

        this.startGame(newSeed);
    }

    startGame(newSeed = false) {
        if (!this.isInitialized || this.canvas.width === 0) return;
        if (newSeed) this.settings.seed = Date.now();

        this.gameState.isWon = false;
        const winMsg = document.getElementById('win-message');
        if(winMsg) winMsg.classList.add('hidden');

        this.generateSolvableMaze();
        this.shuffleCharacters();
        this.createCharacterSelectionUI();

        const entranceGap = this.mazeGeometry.gaps[this.settings.rings];
        const entranceRingIndex = this.settings.rings - 1;
        const entranceAngle = entranceGap.angle;
        const entranceCell = this.angleToCell(entranceAngle, entranceRingIndex);
        
        this.gameState.player = { ring: entranceRingIndex, cell: entranceCell };
        this.gameState.trail = [{ ...this.gameState.player }];

        this.drawAll();
    }
    
    // New generation logic based on user's plain English rules
    generateSolvableMaze() {
        const { rings, seed } = this.settings;
        const { radii, ringWidth, innerRadius } = this.getRadii();
        if (radii.length === 0) return;

        let rngSeed = seed;
        const random = () => { rngSeed = (rngSeed * 9301 + 49297) % 233280; return rngSeed / 233280; };

        const gapLinearWidth = ringWidth; // Rule #2: Fixed linear width
        const generatedGaps = [];

        // Rule #4: Generate from outside in
        let lastGapAngle = random() * 2 * Math.PI; 
        generatedGaps[rings] = {
            radius: radii[rings],
            angle: lastGapAngle,
            angularWidth: gapLinearWidth / radii[rings]
        };

        for (let i = rings - 1; i >= 0; i--) {
            // Rule #4: Place inner gap in opposite half
            const offset = (random() - 0.5) * (Math.PI / 2); // Add some wobble
            let newAngle = (lastGapAngle + Math.PI + offset) % (2 * Math.PI);
            
            generatedGaps[i] = {
                radius: radii[i],
                angle: newAngle,
                angularWidth: gapLinearWidth / radii[i]
            };
            lastGapAngle = newAngle;
        }

        const generatedBarriers = [];
        // Rule #3: Place barriers at the midpoint arc between gaps
        for (let i = 0; i < rings; i++) {
            const gap1 = generatedGaps[i];
            const gap2 = generatedGaps[i+1];

            let barrierAngle = (gap1.angle + gap2.angle) / 2;
            // Handle wraparound case for midpoint calculation
            if (Math.abs(gap1.angle - gap2.angle) > Math.PI) {
                barrierAngle = (barrierAngle + Math.PI) % (2 * Math.PI);
            }
            
            // This logic ensures barrier doesn't clash with gaps
            generatedBarriers.push({ 
                startRadius: radii[i],
                endRadius: radii[i + 1],
                angle: barrierAngle
            });
        }

        this.mazeGeometry = { radii, gaps: generatedGaps, barriers: generatedBarriers };
    }

    drawAll() {
        const size = parseFloat(this.canvas.style.width);
        if (!this.ctx || size === 0) return;
        this.ctx.clearRect(0, 0, size, size);

        this.drawMaze();
        this.drawGoal();
        if (!this.gameState.isWon) {
            this.drawTrail();
            this.drawPlayer();
        }
    }

    drawMaze() {
        const { radii, gaps, barriers } = this.mazeGeometry;
        if (!radii || gaps.length === 0) return;

        const { centerX, centerY } = this.getCanvasCenter();
        this.ctx.strokeStyle = this.theme.mazeColor || '#333';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';

        // Draw Ring Walls (arcs with gaps)
        for (let i = 0; i < gaps.length; i++) {
            const gap = gaps[i];
            if(!gap) continue;
            const startAngle = gap.angle + gap.angularWidth / 2;
            const endAngle = startAngle - gap.angularWidth + 2 * Math.PI;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, gap.radius, startAngle, endAngle);
            this.ctx.stroke();
        }

        // Draw Radial Barriers
        for (const barrier of barriers) {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + barrier.startRadius * Math.cos(barrier.angle), centerY + barrier.startRadius * Math.sin(barrier.angle));
            this.ctx.lineTo(centerX + barrier.endRadius * Math.cos(barrier.angle), centerY + barrier.endRadius * Math.sin(barrier.angle));
            this.ctx.stroke();
        }
    }

    shuffleCharacters() {
        if (!this.theme || !this.theme.characters) return;
        let characters = [...this.theme.characters];
        this.goalCharacter = characters.find(c => c.isGoal) || characters.shift();
        characters = characters.filter(c => !c.isGoal);
        this.displayCharacters = characters.sort(() => 0.5 - Math.random()).slice(0, 6);
        if (this.displayCharacters.length > 0) {
            this.selectedCharacter = this.displayCharacters[0];
        }
    }

    createCharacterSelectionUI() {
        const container = document.getElementById('circle-character-selection');
        if (!container || !this.displayCharacters) return;
        container.innerHTML = '';
        this.displayCharacters.forEach(char => {
            const img = document.createElement('img');
            img.src = char.image;
            img.alt = char.name;
            img.className = 'character-btn';
            if (this.selectedCharacter && this.selectedCharacter.name === char.name) {
                img.classList.add('selected');
            }
            img.onclick = () => {
                if (this.gameState.isWon) return;
                this.selectedCharacter = char;
                this.createCharacterSelectionUI();
                this.drawAll();
            };
            container.appendChild(img);
        });
    }

    drawTrail() {
        if (this.gameState.trail.length < 2) return;
        const { ringWidth } = this.getRadii();
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = ringWidth * 0.3;

        for (let i = 1; i < this.gameState.trail.length; i++) {
            const p1 = this.getCanvasCoords(this.gameState.trail[i - 1]);
            const p2 = this.getCanvasCoords(this.gameState.trail[i]);
            const hue = (i * 20) % 360;
            this.ctx.strokeStyle = `hsl(${hue}, 90%, 65%)`;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
        }
    }

    drawPlayer() {
        if (!this.selectedCharacter) return;
        const center = this.getCanvasCoords(this.gameState.player);
        const { ringWidth } = this.getRadii();
        const size = ringWidth * 0.8;
        const img = this.imageCache.get(this.selectedCharacter.image);
        if (img) this.drawImage(img, center.x, center.y, size, true);
    }

    drawGoal() {
        if (!this.goalCharacter) return;
        const { centerX, centerY } = this.getCanvasCenter();
        const { innerRadius } = this.getRadii();
        const size = innerRadius * 1.6;
        const imgSrc = this.gameState.isWon && this.goalCharacter.winImage ? this.goalCharacter.winImage : this.goalCharacter.image;
        const img = this.imageCache.get(imgSrc);
        if (img) this.drawImage(img, centerX, centerY, size, false);
    }

    drawImage(img, x, y, size, isPlayer) {
        this.ctx.save();
        if (isPlayer) {
            this.ctx.shadowColor = 'rgba(0, 123, 255, 0.9)';
            this.ctx.shadowBlur = 15;
        }
        this.ctx.beginPath();
        this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.clip();
        this.ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
        this.ctx.restore();
    }

    setupInteractionListeners() {
        this.canvas.addEventListener('mousedown', e => this.handleDragStart(e));
        this.canvas.addEventListener('mousemove', e => this.handleDragMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleDragEnd());
        this.canvas.addEventListener('mouseleave', () => this.handleDragEnd());
        this.canvas.addEventListener('touchstart', e => { e.preventDefault(); this.handleDragStart(e.touches[0]); }, { passive: false });
        this.canvas.addEventListener('touchmove', e => { e.preventDefault(); this.handleDragMove(e.touches[0]); }, { passive: false });
        this.canvas.addEventListener('touchend', () => this.handleDragEnd());
    }

    handleDragStart(e) {
        if (this.gameState.isWon) return;
        const pos = this.getEventPosition(e);
        const playerPos = this.getCanvasCoords(this.gameState.player);
        const { ringWidth } = this.getRadii();
        if (Math.hypot(pos.x - playerPos.x, pos.y - playerPos.y) < ringWidth) {
            this.gameState.isDragging = true;
        }
    }

    handleDragMove(e) {
        if (!this.gameState.isDragging || this.gameState.isWon) return;
        const gridPos = this.getGridCoords(this.getEventPosition(e));

        if (!gridPos || (gridPos.ring === this.gameState.player.ring && gridPos.cell === this.gameState.player.cell)) return;

        if (this.isValidMove(this.gameState.player, gridPos)) {
            const lastTrailIndex = this.gameState.trail.findIndex(p => p.ring === gridPos.ring && p.cell === gridPos.cell);
            if (lastTrailIndex !== -1) {
                this.gameState.trail.splice(lastTrailIndex + 1);
            } else {
                this.gameState.trail.push(gridPos);
            }

            this.gameState.player = gridPos;
            this.drawAll();

            if (gridPos.ring === -1) {
                this.handleWin();
            }
        }
    }

    handleDragEnd() { this.gameState.isDragging = false; }

    handleWin() {
        this.gameState.isWon = true;
        this.gameState.isDragging = false;
        const winMsg = document.getElementById('win-message');
        if(winMsg) winMsg.classList.remove('hidden');
        this.drawAll();
    }

    getCanvasCenter = () => ({ centerX: parseFloat(this.canvas.style.width) / 2, centerY: parseFloat(this.canvas.style.height) / 2 });

    getRadii() {
        const size = parseFloat(this.canvas.style.width);
        if (!size) return { radii: [] };
        const rings = this.settings.rings;
        const maxRadius = size / 2 - 10;
        const minRadius = maxRadius * 0.2; // Rule #1: Innermost circle is 20% of outer
        const ringWidth = (maxRadius - minRadius) / rings;
        const radii = Array.from({ length: rings + 1 }, (_, i) => minRadius + (i / rings) * (maxRadius - minRadius));
        return { innerRadius: minRadius, ringWidth, radii };
    }

    getEventPosition = e => ({ x: e.clientX - this.canvas.getBoundingClientRect().left, y: e.clientY - this.canvas.getBoundingClientRect().top });

    angleToCell(angle, ring) {
        const numCells = (ring + 2) * 6;
        return Math.floor(angle * numCells / (2 * Math.PI));
    }

    getGridCoords(pos) {
        const { centerX, centerY } = this.getCanvasCenter();
        const { radii } = this.getRadii();
        if (!radii || radii.length === 0) return null;

        const dx = pos.x - centerX;
        const dy = pos.y - centerY;
        const dist = Math.hypot(dx, dy);

        if (dist < radii[0]) return { ring: -1, cell: -1 };

        let ring = radii.findIndex((r, i) => i > 0 && dist < r) -1;
        if (ring < 0 && dist > radii[radii.length-1]) ring = this.settings.rings -1; // Handle being outside the last ring
        if (ring < 0 || ring >= this.settings.rings) return null;

        const angle = (Math.atan2(dy, dx) + 2 * Math.PI) % (2 * Math.PI);
        const cell = this.angleToCell(angle, ring);
        return { ring, cell };
    }

    getCanvasCoords({ ring, cell }) {
        if (ring === -1) return this.getCanvasCenter();
        const { radii } = this.mazeGeometry;
        if (!radii || radii.length === 0) return { x: 0, y: 0 };

        const { centerX, centerY } = this.getCanvasCenter();
        const numCells = (ring + 2) * 6;
        const ringRadius = (radii[ring] + radii[ring + 1]) / 2;
        const angle = (cell + 0.5) * (2 * Math.PI) / numCells;
        return { x: centerX + ringRadius * Math.cos(angle), y: centerY + ringRadius * Math.sin(angle) };
    }

    isAngleBetween(angle, start, end) {
        // Normalize angles to be between 0 and 2*PI
        angle = (angle + 2 * Math.PI) % (2 * Math.PI);
        start = (start + 2 * Math.PI) % (2 * Math.PI);
        end = (end + 2 * Math.PI) % (2 * Math.PI);
        
        if (start < end) return angle >= start && angle <= end;
        return angle >= start || angle <= end; // Handles wraparound case
    }

    isValidMove(from, to) {
        const { gaps, barriers } = this.mazeGeometry;
        if (!gaps || gaps.length === 0) return false;

        const fromAngle = this.getAngleForCoord(from);
        const toAngle = this.getAngleForCoord(to);

        // Moving to center (Win condition)
        if (to.ring === -1) {
            if (from.ring !== 0) return false;
            const goalGap = gaps[0];
            return this.isAngleBetween(fromAngle, goalGap.angle - goalGap.angularWidth / 2, goalGap.angle + goalGap.angularWidth / 2);
        }

        // Moving between rings (in/out)
        if (from.ring !== to.ring) {
            const ringToCross = (from.ring > to.ring) ? from.ring : to.ring;
            if (Math.abs(from.ring - to.ring) !== 1) return false; // Not adjacent rings

            const gapToCross = gaps[ringToCross];
            const moveAngle = (fromAngle + toAngle) / 2;
            if(Math.abs(fromAngle - toAngle) > Math.PI) moveAngle += Math.PI;

            return this.isAngleBetween(moveAngle, gapToCross.angle - gapToCross.angularWidth / 2, gapToCross.angle + gapToCross.angularWidth / 2);
        }

        // Moving within the same ring (sideways)
        if (from.ring === to.ring) {
            const barrier = barriers[from.ring];
            // Check if the path between fromAngle and toAngle crosses the barrier.angle
            return !this.isAngleBetween(barrier.angle, fromAngle, toAngle);
        }

        return false;
    }

    getAngleForCoord({ring, cell}){
         const numCells = (ring + 2) * 6;
         return (cell + 0.5) * (2 * Math.PI) / numCells;
    }
}
customElements.define('maze-circle', MazeCircle);
