class ChessGame {
    constructor() {
        this.canvas = document.getElementById('chess-board');
        this.ctx = this.canvas.getContext('2d');
        this.boardSize = 450;
        this.cellSize = this.boardSize / 8;
        this.pieceSize = this.cellSize * 0.8;
        
        // 初始化棋盘状态
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.validMoves = [];
        this.isRedTurn = true;
        this.gameHistory = [];
        
        // 检查是否支持 SharedArrayBuffer
        if (typeof SharedArrayBuffer === 'undefined') {
            console.warn('SharedArrayBuffer is not supported, using alternative engine initialization');
            // 使用替代方案初始化引擎
            this.engine = new Worker('stockfish.js', { type: 'module' });
        } else {
            // 正常初始化引擎
            this.engine = new Worker('stockfish.js');
        }
        
        // 绑定事件
        this.engine.onmessage = (event) => this.handleEngineMessage(event);
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        document.getElementById('start-game').addEventListener('click', this.startNewGame.bind(this));
        document.getElementById('undo-move').addEventListener('click', this.undoMove.bind(this));
        
        // 开始新游戏
        this.startNewGame();
    }
    
    initializeBoard() {
        // 初始化棋盘状态
        const board = Array(9).fill().map(() => Array(10).fill(null));
        
        // 放置红方棋子
        const redPieces = [
            { type: '车', x: 0, y: 9 },
            { type: '马', x: 1, y: 9 },
            { type: '相', x: 2, y: 9 },
            { type: '士', x: 3, y: 9 },
            { type: '帅', x: 4, y: 9 },
            { type: '士', x: 5, y: 9 },
            { type: '相', x: 6, y: 9 },
            { type: '马', x: 7, y: 9 },
            { type: '车', x: 8, y: 9 },
            { type: '炮', x: 1, y: 7 },
            { type: '炮', x: 7, y: 7 },
            { type: '兵', x: 0, y: 6 },
            { type: '兵', x: 2, y: 6 },
            { type: '兵', x: 4, y: 6 },
            { type: '兵', x: 6, y: 6 },
            { type: '兵', x: 8, y: 6 }
        ];
        
        // 放置黑方棋子
        const blackPieces = [
            { type: '车', x: 0, y: 0 },
            { type: '马', x: 1, y: 0 },
            { type: '象', x: 2, y: 0 },
            { type: '仕', x: 3, y: 0 },
            { type: '将', x: 4, y: 0 },
            { type: '仕', x: 5, y: 0 },
            { type: '象', x: 6, y: 0 },
            { type: '马', x: 7, y: 0 },
            { type: '车', x: 8, y: 0 },
            { type: '炮', x: 1, y: 2 },
            { type: '炮', x: 7, y: 2 },
            { type: '卒', x: 0, y: 3 },
            { type: '卒', x: 2, y: 3 },
            { type: '卒', x: 4, y: 3 },
            { type: '卒', x: 6, y: 3 },
            { type: '卒', x: 8, y: 3 }
        ];
        
        redPieces.forEach(piece => {
            board[piece.x][piece.y] = { type: piece.type, color: 'red' };
        });
        
        blackPieces.forEach(piece => {
            board[piece.x][piece.y] = { type: piece.type, color: 'black' };
        });
        
        return board;
    }
    
    drawBoard() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制棋盘背景
        this.ctx.fillStyle = '#f0d9b5';
        this.ctx.fillRect(0, 0, this.boardSize, this.boardSize);
        
        // 绘制网格线
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        
        // 绘制横线
        for (let i = 0; i <= 9; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.boardSize, i * this.cellSize);
            this.ctx.stroke();
        }
        
        // 绘制竖线
        for (let i = 0; i <= 8; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.boardSize);
            this.ctx.stroke();
        }
        
        // 绘制九宫格
        this.ctx.beginPath();
        this.ctx.moveTo(3 * this.cellSize, 0);
        this.ctx.lineTo(5 * this.cellSize, 2 * this.cellSize);
        this.ctx.moveTo(5 * this.cellSize, 0);
        this.ctx.lineTo(3 * this.cellSize, 2 * this.cellSize);
        this.ctx.moveTo(3 * this.cellSize, 7 * this.cellSize);
        this.ctx.lineTo(5 * this.cellSize, 9 * this.cellSize);
        this.ctx.moveTo(5 * this.cellSize, 7 * this.cellSize);
        this.ctx.lineTo(3 * this.cellSize, 9 * this.cellSize);
        this.ctx.stroke();
        
        // 绘制棋子
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                const piece = this.board[x][y];
                if (piece) {
                    this.drawPiece(x, y, piece);
                }
            }
        }
        
        // 绘制选中棋子的有效移动位置
        if (this.selectedPiece) {
            this.validMoves.forEach(move => {
                this.ctx.beginPath();
                this.ctx.arc(
                    move.x * this.cellSize + this.cellSize / 2,
                    move.y * this.cellSize + this.cellSize / 2,
                    this.pieceSize / 4,
                    0,
                    Math.PI * 2
                );
                this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                this.ctx.fill();
            });
        }
    }
    
    drawPiece(x, y, piece) {
        const centerX = x * this.cellSize + this.cellSize / 2;
        const centerY = y * this.cellSize + this.cellSize / 2;
        
        // 绘制棋子背景
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.pieceSize / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = piece.color === 'red' ? '#ff4444' : '#000';
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 绘制棋子文字
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${this.pieceSize * 0.6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(piece.type, centerX, centerY);
    }
    
    handleClick(event) {
        if (!this.isRedTurn) return; // 只有红方（玩家）可以移动
        
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / this.cellSize);
        const y = Math.floor((event.clientY - rect.top) / this.cellSize);
        
        if (x < 0 || x >= 9 || y < 0 || y >= 10) return;
        
        const clickedPiece = this.board[x][y];
        
        if (this.selectedPiece) {
            // 尝试移动棋子
            const move = this.validMoves.find(m => m.x === x && m.y === y);
            if (move) {
                this.makeMove(this.selectedPiece.x, this.selectedPiece.y, x, y);
                this.selectedPiece = null;
                this.validMoves = [];
                this.isRedTurn = false;
                this.drawBoard();
                this.makeAIMove();
            } else if (clickedPiece && clickedPiece.color === 'red') {
                // 选择新的红方棋子
                this.selectedPiece = { x, y, piece: clickedPiece };
                this.validMoves = this.getValidMoves(x, y);
                this.drawBoard();
            } else {
                this.selectedPiece = null;
                this.validMoves = [];
                this.drawBoard();
            }
        } else if (clickedPiece && clickedPiece.color === 'red') {
            // 选择红方棋子
            this.selectedPiece = { x, y, piece: clickedPiece };
            this.validMoves = this.getValidMoves(x, y);
            this.drawBoard();
        }
    }
    
    getValidMoves(x, y) {
        const piece = this.board[x][y];
        if (!piece) return [];
        
        const moves = [];
        const type = piece.type;
        
        // 这里实现各种棋子的移动规则
        // 简化版：只实现基本的移动规则
        switch (type) {
            case '车':
            case '车':
                // 车的移动规则：直线移动
                for (let i = 0; i < 9; i++) {
                    if (i !== x) moves.push({ x: i, y });
                    if (i !== y) moves.push({ x, y: i });
                }
                break;
            case '马':
            case '马':
                // 马的移动规则：日字
                const horseMoves = [
                    { dx: 1, dy: 2 },
                    { dx: 2, dy: 1 },
                    { dx: 2, dy: -1 },
                    { dx: 1, dy: -2 },
                    { dx: -1, dy: -2 },
                    { dx: -2, dy: -1 },
                    { dx: -2, dy: 1 },
                    { dx: -1, dy: 2 }
                ];
                horseMoves.forEach(move => {
                    const newX = x + move.dx;
                    const newY = y + move.dy;
                    if (newX >= 0 && newX < 9 && newY >= 0 && newY < 10) {
                        moves.push({ x: newX, y: newY });
                    }
                });
                break;
            // 其他棋子的移动规则...
        }
        
        // 过滤掉无效的移动（比如被己方棋子阻挡）
        return moves.filter(move => {
            const targetPiece = this.board[move.x][move.y];
            return !targetPiece || targetPiece.color !== piece.color;
        });
    }
    
    makeMove(fromX, fromY, toX, toY) {
        const piece = this.board[fromX][fromY];
        this.board[fromX][fromY] = null;
        this.board[toX][toY] = piece;
        
        // 记录移动历史
        this.gameHistory.push({
            from: { x: fromX, y: fromY },
            to: { x: toX, y: toY },
            piece: piece
        });
    }
    
    makeAIMove() {
        // 简单的 AI 策略：随机选择一个黑方棋子，然后随机选择一个有效移动
        const blackPieces = [];
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                const piece = this.board[x][y];
                if (piece && piece.color === 'black') {
                    const moves = this.getValidMoves(x, y);
                    if (moves.length > 0) {
                        blackPieces.push({ x, y, moves });
                    }
                }
            }
        }
        
        if (blackPieces.length > 0) {
            // 随机选择一个棋子
            const randomPiece = blackPieces[Math.floor(Math.random() * blackPieces.length)];
            // 随机选择一个移动
            const randomMove = randomPiece.moves[Math.floor(Math.random() * randomPiece.moves.length)];
            
            // 执行移动
            this.makeMove(randomPiece.x, randomPiece.y, randomMove.x, randomMove.y);
            this.isRedTurn = true;
            this.drawBoard();
            
            // 更新游戏状态
            document.getElementById('game-status').textContent = '轮到红方（玩家）走棋';
        }
    }
    
    startNewGame() {
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.validMoves = [];
        this.isRedTurn = true;
        this.gameHistory = [];
        this.drawBoard();
        document.getElementById('game-status').textContent = '游戏开始！红方（玩家）先走';
    }
    
    undoMove() {
        if (this.gameHistory.length > 0) {
            const lastMove = this.gameHistory.pop();
            this.board[lastMove.to.x][lastMove.to.y] = null;
            this.board[lastMove.from.x][lastMove.from.y] = lastMove.piece;
            this.isRedTurn = !this.isRedTurn;
            this.drawBoard();
        }
    }
    
    handleEngineMessage(event) {
        const message = event.data;
        if (message.startsWith('bestmove')) {
            const move = message.split(' ')[1];
            if (move && move !== '(none)') {
                // 解析 AI 的移动并执行
                const fromX = move.charCodeAt(0) - 'a'.charCodeAt(0);
                const fromY = 9 - (move.charCodeAt(1) - '0'.charCodeAt(0));
                const toX = move.charCodeAt(2) - 'a'.charCodeAt(0);
                const toY = 9 - (move.charCodeAt(3) - '0'.charCodeAt(0));
                
                this.makeMove(fromX, fromY, toX, toY);
                this.isRedTurn = true;
                this.drawBoard();
            }
        }
    }
}

// 初始化游戏
window.onload = () => {
    new ChessGame();
}; 