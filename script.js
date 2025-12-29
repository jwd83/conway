class GameOfLife {
    constructor(canvasId, gridSize = 30) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = gridSize;
        this.cellSize = 15;
        this.grid = [];
        this.isRunning = false;
        this.generation = 0;
        this.animationId = null;
        this.fps = 10;
        this.lastFrameTime = 0;

        this.init();
        this.setupEventListeners();
    }

    init() {
        this.canvas.width = this.gridSize * this.cellSize;
        this.canvas.height = this.gridSize * this.cellSize;
        this.grid = this.createEmptyGrid();
        this.generation = 0;
        this.draw();
        this.updateStats();
    }

    createEmptyGrid() {
        return Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
    }

    createRandomGrid() {
        return Array(this.gridSize).fill(null).map(() =>
            Array(this.gridSize).fill(null).map(() => Math.random() > 0.7 ? 1 : 0)
        );
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === 1) {
                    this.ctx.fillStyle = '#4a90d9';
                    this.ctx.fillRect(col * this.cellSize, row * this.cellSize, this.cellSize - 1, this.cellSize - 1);
                } else {
                    this.ctx.fillStyle = '#111';
                    this.ctx.fillRect(col * this.cellSize, row * this.cellSize, this.cellSize - 1, this.cellSize - 1);
                }
            }
        }
    }

    countNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;

                const newRow = row + i;
                const newCol = col + j;

                if (newRow >= 0 && newRow < this.gridSize && newCol >= 0 && newCol < this.gridSize) {
                    count += this.grid[newRow][newCol];
                }
            }
        }
        return count;
    }

    nextGeneration() {
        const newGrid = this.createEmptyGrid();

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const neighbors = this.countNeighbors(row, col);
                const cell = this.grid[row][col];

                if (cell === 1) {
                    if (neighbors < 2 || neighbors > 3) {
                        newGrid[row][col] = 0;
                    } else {
                        newGrid[row][col] = 1;
                    }
                } else {
                    if (neighbors === 3) {
                        newGrid[row][col] = 1;
                    }
                }
            }
        }

        this.grid = newGrid;
        this.generation++;
        this.draw();
        this.updateStats();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    animate(currentTime) {
        if (!this.isRunning) return;

        const frameDelay = 1000 / this.fps;

        if (currentTime - this.lastFrameTime >= frameDelay) {
            this.nextGeneration();
            this.lastFrameTime = currentTime;
        }

        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }

    clear() {
        this.stop();
        this.grid = this.createEmptyGrid();
        this.generation = 0;
        this.draw();
        this.updateStats();
    }

    random() {
        this.stop();
        this.grid = this.createRandomGrid();
        this.generation = 0;
        this.draw();
        this.updateStats();
    }

    toggleCell(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            this.grid[row][col] = this.grid[row][col] ? 0 : 1;
            this.draw();
            this.updateStats();
        }
    }

    setGridSize(size) {
        this.stop();
        this.gridSize = size;
        this.init();
    }

    setFPS(fps) {
        this.fps = fps;
    }

    getPopulation() {
        let count = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                count += this.grid[row][col];
            }
        }
        return count;
    }

    updateStats() {
        document.getElementById('generationCount').textContent = this.generation;
        document.getElementById('populationCount').textContent = this.getPopulation();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.toggleCell(x, y);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new GameOfLife('gameCanvas', 30);

    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stepBtn = document.getElementById('stepBtn');
    const clearBtn = document.getElementById('clearBtn');
    const randomBtn = document.getElementById('randomBtn');
    const speedSlider = document.getElementById('speedSlider');
    const gridSizeSlider = document.getElementById('gridSizeSlider');
    const speedValue = document.getElementById('speedValue');
    const gridSizeValue = document.getElementById('gridSizeValue');
    const gridSizeValue2 = document.getElementById('gridSizeValue2');

    startBtn.addEventListener('click', () => {
        game.start();
        startBtn.disabled = true;
        pauseBtn.disabled = false;
    });

    pauseBtn.addEventListener('click', () => {
        game.stop();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    });

    stepBtn.addEventListener('click', () => {
        game.stop();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        game.nextGeneration();
    });

    clearBtn.addEventListener('click', () => {
        game.clear();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    });

    randomBtn.addEventListener('click', () => {
        game.random();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    });

    speedSlider.addEventListener('input', () => {
        const fps = parseInt(speedSlider.value);
        game.setFPS(fps);
        speedValue.textContent = fps;
    });

    gridSizeSlider.addEventListener('input', () => {
        const size = parseInt(gridSizeSlider.value);
        gridSizeValue.textContent = size;
        gridSizeValue2.textContent = size;
    });

    gridSizeSlider.addEventListener('change', () => {
        const size = parseInt(gridSizeSlider.value);
        game.setGridSize(size);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    });
});
