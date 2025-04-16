class GomokuGame {
    constructor() {
        this.canvas = document.getElementById('gomoku-board');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置棋盘尺寸
        this.boardSize = 15; // 15x15的棋盘
        this.cellSize = Math.min(this.canvas.width, this.canvas.height) / (this.boardSize + 1);
        this.pieceRadius = this.cellSize * 0.4;
        
        // 设置边距
        this.margin = this.cellSize;
        
        // 初始化棋盘状态
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black'; // 黑方先走
        this.gameOver = false;
        this.lastMove = null;
        this.moveHistory = [];
        
        // 绑定事件
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        document.getElementById('start-game').addEventListener('click', this.startNewGame.bind(this));
        document.getElementById('undo-move').addEventListener('click', this.undoMove.bind(this));
        
        // 开始新游戏
        this.startNewGame();
    }
    
    startNewGame() {
        // 重置游戏状态
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.lastMove = null;
        this.moveHistory = [];
        
        // 更新状态显示
        document.getElementById('game-status').textContent = '游戏开始！黑方（玩家）先走';
        
        // 绘制棋盘
        this.drawBoard();
    }
    
    drawBoard() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 设置线条样式
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        
        // 绘制横线和竖线
        for (let i = 0; i < this.boardSize; i++) {
            // 横线
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin, this.margin + i * this.cellSize);
            this.ctx.lineTo(this.margin + (this.boardSize - 1) * this.cellSize, this.margin + i * this.cellSize);
            this.ctx.stroke();
            
            // 竖线
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin + i * this.cellSize, this.margin);
            this.ctx.lineTo(this.margin + i * this.cellSize, this.margin + (this.boardSize - 1) * this.cellSize);
            this.ctx.stroke();
        }
        
        // 绘制棋子
        for (let x = 0; x < this.boardSize; x++) {
            for (let y = 0; y < this.boardSize; y++) {
                if (this.board[x][y]) {
                    this.drawPiece(x, y, this.board[x][y]);
                }
            }
        }
        
        // 标记最后一步
        if (this.lastMove) {
            this.drawLastMoveMarker(this.lastMove.x, this.lastMove.y);
        }
    }
    
    drawPiece(x, y, color) {
        const centerX = this.margin + x * this.cellSize;
        const centerY = this.margin + y * this.cellSize;
        
        // 绘制棋子
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.pieceRadius, 0, Math.PI * 2);
        
        // 设置渐变
        const gradient = this.ctx.createRadialGradient(
            centerX - this.pieceRadius / 3,
            centerY - this.pieceRadius / 3,
            this.pieceRadius / 10,
            centerX,
            centerY,
            this.pieceRadius
        );
        
        if (color === 'black') {
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
        } else {
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    drawLastMoveMarker(x, y) {
        const centerX = this.margin + x * this.cellSize;
        const centerY = this.margin + y * this.cellSize;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.pieceRadius / 3, 0, Math.PI * 2);
        this.ctx.fillStyle = 'red';
        this.ctx.fill();
    }
    
    handleClick(event) {
        if (this.gameOver || this.currentPlayer === 'white') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.round((event.clientX - rect.left - this.margin) / this.cellSize);
        const y = Math.round((event.clientY - rect.top - this.margin) / this.cellSize);
        
        // 检查点击是否在棋盘范围内
        if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) return;
        
        // 检查该位置是否已有棋子
        if (this.board[x][y]) return;
        
        // 放置棋子
        this.makeMove(x, y);
    }
    
    makeMove(x, y) {
        // 记录移动
        this.moveHistory.push({ x, y, player: this.currentPlayer });
        
        // 更新棋盘状态
        this.board[x][y] = this.currentPlayer;
        this.lastMove = { x, y };
        
        // 检查是否获胜
        if (this.checkWin(x, y)) {
            this.gameOver = true;
            document.getElementById('game-status').textContent = 
                `${this.currentPlayer === 'black' ? '黑方' : '白方'}获胜！`;
            return;
        }
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        
        // 更新状态显示
        document.getElementById('game-status').textContent = 
            `轮到${this.currentPlayer === 'black' ? '黑方' : '白方'}走棋`;
        
        // 重绘棋盘
        this.drawBoard();
        
        // 如果是AI回合，延迟执行AI移动
        if (this.currentPlayer === 'white' && !this.gameOver) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    makeAIMove() {
        const move = this.findBestMove();
        if (move) {
            this.makeMove(move.x, move.y);
        }
    }
    
    findBestMove() {
        // 使用Alpha-Beta剪枝算法寻找最佳移动
        let bestScore = -Infinity;
        let bestMove = null;
        const depth = 3; // 搜索深度
        
        // 获取所有可能的移动
        const moves = this.getPossibleMoves();
        
        for (const move of moves) {
            // 尝试移动
            this.board[move.x][move.y] = 'white';
            
            // 评估移动
            const score = this.alphaBeta(depth, -Infinity, Infinity, false);
            
            // 撤销移动
            this.board[move.x][move.y] = null;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    alphaBeta(depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return this.evaluateBoard();
        }
        
        const moves = this.getPossibleMoves();
        
        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of moves) {
                this.board[move.x][move.y] = 'white';
                const score = this.alphaBeta(depth - 1, alpha, beta, false);
                this.board[move.x][move.y] = null;
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of moves) {
                this.board[move.x][move.y] = 'black';
                const score = this.alphaBeta(depth - 1, alpha, beta, true);
                this.board[move.x][move.y] = null;
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return minScore;
        }
    }
    
    evaluateBoard() {
        let score = 0;
        
        // 评估每个可能的五子连珠方向
        for (let x = 0; x < this.boardSize; x++) {
            for (let y = 0; y < this.boardSize; y++) {
                if (this.board[x][y]) {
                    // 水平方向
                    score += this.evaluateDirection(x, y, 1, 0);
                    // 垂直方向
                    score += this.evaluateDirection(x, y, 0, 1);
                    // 对角线方向
                    score += this.evaluateDirection(x, y, 1, 1);
                    // 反对角线方向
                    score += this.evaluateDirection(x, y, 1, -1);
                }
            }
        }
        
        return score;
    }
    
    evaluateDirection(x, y, dx, dy) {
        const player = this.board[x][y];
        let count = 1;
        let openEnds = 0;
        
        // 向前检查
        let i = 1;
        while (i < 5) {
            const newX = x + i * dx;
            const newY = y + i * dy;
            if (newX < 0 || newX >= this.boardSize || newY < 0 || newY >= this.boardSize) break;
            if (this.board[newX][newY] === player) {
                count++;
            } else if (this.board[newX][newY] === null) {
                openEnds++;
                break;
            } else {
                break;
            }
            i++;
        }
        
        // 向后检查
        i = 1;
        while (i < 5) {
            const newX = x - i * dx;
            const newY = y - i * dy;
            if (newX < 0 || newX >= this.boardSize || newY < 0 || newY >= this.boardSize) break;
            if (this.board[newX][newY] === player) {
                count++;
            } else if (this.board[newX][newY] === null) {
                openEnds++;
                break;
            } else {
                break;
            }
            i++;
        }
        
        // 根据连子数和开放端数评分
        if (count >= 5) return player === 'white' ? 100000 : -100000;
        if (count === 4) return player === 'white' ? (openEnds === 2 ? 10000 : 1000) : (openEnds === 2 ? -10000 : -1000);
        if (count === 3) return player === 'white' ? (openEnds === 2 ? 1000 : 100) : (openEnds === 2 ? -1000 : -100);
        if (count === 2) return player === 'white' ? (openEnds === 2 ? 100 : 10) : (openEnds === 2 ? -100 : -10);
        return 0;
    }
    
    getPossibleMoves() {
        const moves = [];
        const center = Math.floor(this.boardSize / 2);
        
        // 优先考虑已有棋子周围的空位
        for (let x = 0; x < this.boardSize; x++) {
            for (let y = 0; y < this.boardSize; y++) {
                if (this.board[x][y] === null) {
                    // 检查周围是否有棋子
                    let hasNeighbor = false;
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            if (dx === 0 && dy === 0) continue;
                            const newX = x + dx;
                            const newY = y + dy;
                            if (newX >= 0 && newX < this.boardSize && 
                                newY >= 0 && newY < this.boardSize && 
                                this.board[newX][newY]) {
                                hasNeighbor = true;
                                break;
                            }
                        }
                        if (hasNeighbor) break;
                    }
                    
                    if (hasNeighbor) {
                        moves.push({ x, y });
                    }
                }
            }
        }
        
        // 如果没有可移动的位置，选择中心点
        if (moves.length === 0 && this.board[center][center] === null) {
            moves.push({ x: center, y: center });
        }
        
        return moves;
    }
    
    checkWin(x, y) {
        const directions = [
            [1, 0],   // 水平
            [0, 1],   // 垂直
            [1, 1],   // 对角线
            [1, -1]   // 反对角线
        ];
        
        const player = this.board[x][y];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            
            // 正向检查
            for (let i = 1; i < 5; i++) {
                const newX = x + i * dx;
                const newY = y + i * dy;
                if (newX < 0 || newX >= this.boardSize || 
                    newY < 0 || newY >= this.boardSize || 
                    this.board[newX][newY] !== player) {
                    break;
                }
                count++;
            }
            
            // 反向检查
            for (let i = 1; i < 5; i++) {
                const newX = x - i * dx;
                const newY = y - i * dy;
                if (newX < 0 || newX >= this.boardSize || 
                    newY < 0 || newY >= this.boardSize || 
                    this.board[newX][newY] !== player) {
                    break;
                }
                count++;
            }
            
            if (count >= 5) return true;
        }
        
        return false;
    }
    
    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        // 撤销最后两步（玩家和AI的移动）
        for (let i = 0; i < 2 && this.moveHistory.length > 0; i++) {
            const move = this.moveHistory.pop();
            this.board[move.x][move.y] = null;
        }
        
        // 更新游戏状态
        this.gameOver = false;
        this.currentPlayer = 'black';
        this.lastMove = this.moveHistory.length > 0 ? 
            { x: this.moveHistory[this.moveHistory.length - 1].x, 
              y: this.moveHistory[this.moveHistory.length - 1].y } : null;
        
        // 更新状态显示
        document.getElementById('game-status').textContent = '轮到黑方走棋';
        
        // 重绘棋盘
        this.drawBoard();
    }
}

// 初始化游戏
window.onload = () => {
    new GomokuGame();
}; 