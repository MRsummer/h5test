class Tetris {
    constructor() {
        this.canvas = document.getElementById('tetris-board');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-piece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // 游戏配置
        this.cols = 10;
        this.rows = 20;
        this.blockSize = 30;
        this.colors = [
            null,
            '#FF0D72', // I
            '#0DC2FF', // J
            '#0DFF72', // L
            '#F538FF', // O
            '#FF8E0D', // S
            '#FFE138', // T
            '#3877FF'  // Z
        ];
        
        // 方块形状定义
        this.pieces = [
            null,
            [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
            [[2, 0, 0], [2, 2, 2], [0, 0, 0]],                         // J
            [[0, 0, 3], [3, 3, 3], [0, 0, 0]],                         // L
            [[0, 4, 4], [0, 4, 4], [0, 0, 0]],                         // O
            [[0, 5, 5], [5, 5, 0], [0, 0, 0]],                         // S
            [[0, 6, 0], [6, 6, 6], [0, 0, 0]],                         // T
            [[7, 7, 0], [0, 7, 7], [0, 0, 0]]                          // Z
        ];
        
        // 游戏状态
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        
        // 绑定事件
        document.getElementById('start-game').addEventListener('click', this.startGame.bind(this));
        document.getElementById('pause-game').addEventListener('click', this.togglePause.bind(this));
        document.getElementById('move-left').addEventListener('click', () => this.move(-1));
        document.getElementById('move-right').addEventListener('click', () => this.move(1));
        document.getElementById('rotate').addEventListener('click', () => this.rotate());
        document.getElementById('soft-drop').addEventListener('click', () => this.drop());
        document.getElementById('hard-drop').addEventListener('click', () => this.hardDrop());
        
        // 初始化游戏
        this.resetGame();
        this.draw();
    }
    
    resetGame() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.dropInterval = 1000;
        this.updateScore();
        this.spawnPiece();
    }
    
    spawnPiece() {
        if (!this.nextPiece) {
            this.nextPiece = {
                matrix: this.pieces[Math.floor(Math.random() * 7) + 1],
                pos: {x: Math.floor(this.cols / 2) - 1, y: 0}
            };
        }
        this.currentPiece = this.nextPiece;
        this.nextPiece = {
            matrix: this.pieces[Math.floor(Math.random() * 7) + 1],
            pos: {x: Math.floor(this.cols / 2) - 1, y: 0}
        };
        this.drawNextPiece();
        
        if (this.collide()) {
            this.gameOver = true;
            document.getElementById('game-status').textContent = '游戏结束！';
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制已固定的方块
        this.board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.ctx.fillStyle = this.colors[value];
                    this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
                    this.ctx.strokeStyle = '#000';
                    this.ctx.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
                }
            });
        });
        
        // 绘制当前方块
        if (this.currentPiece) {
            this.currentPiece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        this.ctx.fillStyle = this.colors[value];
                        this.ctx.fillRect(
                            (this.currentPiece.pos.x + x) * this.blockSize,
                            (this.currentPiece.pos.y + y) * this.blockSize,
                            this.blockSize,
                            this.blockSize
                        );
                        this.ctx.strokeStyle = '#000';
                        this.ctx.strokeRect(
                            (this.currentPiece.pos.x + x) * this.blockSize,
                            (this.currentPiece.pos.y + y) * this.blockSize,
                            this.blockSize,
                            this.blockSize
                        );
                    }
                });
            });
        }
    }
    
    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        const blockSize = 25;
        const offsetX = (this.nextCanvas.width - this.nextPiece.matrix[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.matrix.length * blockSize) / 2;
        
        this.nextPiece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.nextCtx.fillStyle = this.colors[value];
                    this.nextCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                    this.nextCtx.strokeStyle = '#000';
                    this.nextCtx.strokeRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            });
        });
    }
    
    collide() {
        const matrix = this.currentPiece.matrix;
        const pos = this.currentPiece.pos;
        
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] !== 0 &&
                    (this.board[y + pos.y] === undefined ||
                     this.board[y + pos.y][x + pos.x] === undefined ||
                     this.board[y + pos.y][x + pos.x] !== 0)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    merge() {
        this.currentPiece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.board[y + this.currentPiece.pos.y][x + this.currentPiece.pos.x] = value;
                }
            });
        });
    }
    
    rotate() {
        const matrix = this.currentPiece.matrix;
        const N = matrix.length;
        const rotated = Array(N).fill().map(() => Array(N).fill(0));
        
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                rotated[x][N - 1 - y] = matrix[y][x];
            }
        }
        
        const originalMatrix = this.currentPiece.matrix;
        this.currentPiece.matrix = rotated;
        if (this.collide()) {
            this.currentPiece.matrix = originalMatrix;
        }
    }
    
    move(dir) {
        this.currentPiece.pos.x += dir;
        if (this.collide()) {
            this.currentPiece.pos.x -= dir;
        }
    }
    
    drop() {
        this.currentPiece.pos.y++;
        if (this.collide()) {
            this.currentPiece.pos.y--;
            this.merge();
            this.clearLines();
            this.spawnPiece();
        }
        this.dropCounter = 0;
    }
    
    hardDrop() {
        while (!this.collide()) {
            this.currentPiece.pos.y++;
        }
        this.currentPiece.pos.y--;
        this.merge();
        this.clearLines();
        this.spawnPiece();
        this.dropCounter = 0;
    }
    
    clearLines() {
        let linesCleared = 0;
        
        outer: for (let y = this.rows - 1; y >= 0; y--) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x] === 0) {
                    continue outer;
                }
            }
            
            const row = this.board.splice(y, 1)[0].fill(0);
            this.board.unshift(row);
            y++;
            linesCleared++;
        }
        
        if (linesCleared > 0) {
            this.score += this.calculateScore(linesCleared);
            this.lines += linesCleared;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateScore();
        }
    }
    
    calculateScore(lines) {
        const points = [0, 40, 100, 300, 1200];
        return points[lines] * this.level;
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    handleKeyPress(event) {
        // 移除键盘控制
        return;
    }
    
    update(time = 0) {
        if (this.gameOver || this.paused) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }
        
        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }
    
    startGame() {
        if (this.gameOver) {
            this.resetGame();
        }
        this.paused = false;
        document.getElementById('game-status').textContent = '游戏进行中...';
        this.lastTime = 0;
        this.update();
    }
    
    togglePause() {
        this.paused = !this.paused;
        document.getElementById('game-status').textContent = 
            this.paused ? '游戏已暂停' : '游戏进行中...';
        if (!this.paused) {
            this.lastTime = 0;
            this.update();
        }
    }
}

// 初始化游戏
window.onload = () => {
    new Tetris();
}; 