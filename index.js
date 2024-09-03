const stageSize = 25;
const tileSize = 20;
const glideSpeedFactor = 5;

let board;
let canvas;
let interval;
let iteration = 0;
let leftPosition = 0;
let topPosition = 0;
let play = false;

class Cell {
    #_isAlive;
    #_isAliveNext;
    #_neighbours;

    constructor(isAlive) {
        this.#_isAlive = isAlive;
        this.#_neighbours = [];
    }

    get isAlive() {
        return this.#_isAlive;
    }

    get neighbours() {
        return this.#_neighbours;
    }

    setNextLifeState() {
        const aliveNeighbours = this.#_neighbours.filter(neighbourCell => neighbourCell.isAlive).length;
        if (this.#_isAlive) {
            this.#_isAliveNext = aliveNeighbours === 2 || aliveNeighbours === 3;
        } else {
            this.#_isAliveNext = aliveNeighbours === 3;
        }
    }

    evolve() {
        this.#_isAlive = this.#_isAliveNext;
    }
}

class Board {
    #_cells = [];

    constructor(seed) {
        for (var i = 0; i < stageSize; i++) {
            let cellRow = [];
            for (var j = 0; j < stageSize; j++) {
                cellRow.push(new Cell(seed[i][j]));
            }

            this.#_cells.push(cellRow);
        }

        this.#addNeighbours();
    }

    get cells() {
        return this.#_cells;
    }

    evolve() {
        this.#_cells.forEach(row => row.forEach(cell => cell.setNextLifeState()));
        this.#_cells.forEach(row => row.forEach(cell => cell.evolve()));
    }

    shift() {
        let newCells = Array.from({ length: stageSize }, () => Array(stageSize).fill(null));

        for (let i = 0; i < stageSize; i++) {
            for (let j = 0; j < stageSize; j++) {
                let newRow = i - 1 < 0 ? stageSize - 1 : i - 1;
                let newCol = j - 1 < 0 ? stageSize - 1 : j - 1;
                newCells[newRow][newCol] = this.#_cells[i][j];
            }
        }
    
        for (let i = 0; i < stageSize; i++) {
            newCells[i][stageSize - 1] = new Cell(false);
            newCells[stageSize - 1][i] = new Cell(false);
        }
    
        this.#_cells = newCells;
        this.#updateNeighbours();
    }

    print() {
        this.#_cells
            .map(row => row.map(cell => cell.isAlive ? 1 : 0))
            .forEach((row, i) => console.log(`${i}. ${row.join(' ')}`));
    };

    #addNeighbours() {
        for (var i = 0; i < stageSize; i++) {
            for (var j = 0; j < stageSize; j++) {               
                this.#calculateNeighbours(i, j);
            }
        }
    }

    #updateNeighbours() {
        const last = stageSize - 1;
        const secondLast = stageSize - 2;
    
        for (let i = 0; i < stageSize; i++) {
            this.#calculateNeighbours(secondLast, i);
            this.#calculateNeighbours(i, secondLast);
        }
    
        for (let i = 0; i < stageSize; i++) {
            this.#calculateNeighbours(last, i);
            this.#calculateNeighbours(i, last);
        }
    }

    #calculateNeighbours(i, j) {
        this.#_cells[i][j].neighbours.splice(0, this.#_cells[i][j].neighbours.length);
    
        const potentialNeighbours = [
            [i - 1, j - 1], [i, j - 1], [i + 1, j - 1],
            [i - 1, j],                 [i + 1, j],
            [i - 1, j + 1], [i, j + 1], [i + 1, j + 1]
        ];
    
        potentialNeighbours
            .filter(([x, y]) => x >= 0 && x < stageSize && y >= 0 && y < stageSize)
            .forEach(([x, y]) => this.#_cells[i][j].neighbours.push(this.#_cells[x][y]));
    }
}

const seedGlider = () => {
    const startIndex = Math.floor(stageSize / 2) - 1;
    const seed = Array(stageSize).fill().map(() => Array(stageSize).fill(false));
    
    [
        [true, false, false],
        [false, true, true],
        [true, true, false]
    ].forEach((row, i) => {
        row.forEach((cell, j) => {
            seed[i + startIndex][j + startIndex] = cell;
        });
    });

    return seed;
}

const drawGrid = (ctx) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    for (var i = 0; i <= stageSize * tileSize; i+=tileSize) {
        ctx.moveTo(i - leftPosition, 0);
        ctx.lineTo(i - leftPosition, stageSize * tileSize);
        ctx.moveTo(0, i - topPosition);
        ctx.lineTo(stageSize * tileSize, i - topPosition);
    }
    ctx.stroke();
}

const drawBoard = (ctx) => {
    ctx.beginPath();
    for (var i = 0; i < stageSize; i++) {
        for (var j = 0; j < stageSize; j++) {
            if (board.cells[i][j].isAlive) {
                ctx.fillRect(
                    j * tileSize - leftPosition + 2, 
                    i * tileSize - leftPosition + 2, 
                    tileSize - 4, 
                    tileSize - 4);
            }
        }
    }
}

const initCanvas = () => {
    canvas = document.getElementById('canvas');
    var parent = document.getElementById("canvasContainer");
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    board = new Board(seedGlider());
    let ctx = canvas.getContext('2d');
    drawGrid(ctx);
    drawBoard(ctx);
}

const startAnimation = () => {
    let ctx = canvas.getContext('2d');
    interval = setInterval(() => {
        topPosition += 1;
        leftPosition += 1;
        drawGrid(ctx);
        drawBoard(ctx);

        if (topPosition % glideSpeedFactor === 0) {
            board.evolve();
            iteration++;
        }

        if (leftPosition === tileSize || topPosition === tileSize) {
            board.shift();
            leftPosition = 0;
            topPosition = 0;
        }
    }, 50);
}

const stopAnimation = () => {
    clearInterval(interval);
}

const startStopAnimation = () => {
    play = !play;
    const button = document.getElementById('startStopButton');
    document.getElementById('resetButton').disabled = false;
    if (play) {
        button.innerHTML = 'Stop game';
        startAnimation();
    } else {
        button.innerHTML = 'Resume game';
        stopAnimation();
    }
}

const resetAnimation = () => {
    stopAnimation();
    leftPosition = 0;
    topPosition = 0;
    iteration = 0;
    play = false;
    initCanvas();
    document.getElementById('startStopButton').innerHTML = 'Start game';
    document.getElementById('resetButton').disabled = true;
}