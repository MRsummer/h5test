class ChessGame {
    constructor() {
        this.canvas = document.getElementById('chess-board');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置棋盘尺寸
        this.boardWidth = 320;  // 棋盘实际宽度
        this.boardHeight = 360; // 棋盘实际高度
        this.cellWidth = this.boardWidth / 8;  // 格子宽度
        this.cellHeight = this.boardHeight / 9; // 格子高度
        this.pieceSize = Math.min(this.cellWidth, this.cellHeight) * 0.7; // 棋子大小
        
        // 设置边距，确保棋盘居中
        this.marginX = (this.canvas.width - this.boardWidth) / 2;
        this.marginY = (this.canvas.height - this.boardHeight) / 2;
        
        // 初始化棋盘状态
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.validMoves = [];
        this.isRedTurn = true;
        this.gameHistory = [];
        
        // 绑定事件
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
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 设置线条样式
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        
        // 绘制横线
        for (let i = 0; i < 10; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.marginX, this.marginY + i * this.cellHeight);
            this.ctx.lineTo(this.marginX + 8 * this.cellWidth, this.marginY + i * this.cellHeight);
            this.ctx.stroke();
        }
        
        // 绘制竖线
        for (let i = 0; i < 9; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.marginX + i * this.cellWidth, this.marginY);
            // 河界
            if (i === 0 || i === 8) {
                this.ctx.lineTo(this.marginX + i * this.cellWidth, this.marginY + 9 * this.cellHeight);
            } else {
                // 上半部分
                this.ctx.moveTo(this.marginX + i * this.cellWidth, this.marginY);
                this.ctx.lineTo(this.marginX + i * this.cellWidth, this.marginY + 4 * this.cellHeight);
                // 下半部分
                this.ctx.moveTo(this.marginX + i * this.cellWidth, this.marginY + 5 * this.cellHeight);
                this.ctx.lineTo(this.marginX + i * this.cellWidth, this.marginY + 9 * this.cellHeight);
            }
            this.ctx.stroke();
        }
        
        // 绘制九宫格
        // 上方九宫格
        this.ctx.beginPath();
        this.ctx.moveTo(this.marginX + 3 * this.cellWidth, this.marginY);
        this.ctx.lineTo(this.marginX + 5 * this.cellWidth, this.marginY + 2 * this.cellHeight);
        this.ctx.moveTo(this.marginX + 5 * this.cellWidth, this.marginY);
        this.ctx.lineTo(this.marginX + 3 * this.cellWidth, this.marginY + 2 * this.cellHeight);
        this.ctx.stroke();
        
        // 下方九宫格
        this.ctx.beginPath();
        this.ctx.moveTo(this.marginX + 3 * this.cellWidth, this.marginY + 7 * this.cellHeight);
        this.ctx.lineTo(this.marginX + 5 * this.cellWidth, this.marginY + 9 * this.cellHeight);
        this.ctx.moveTo(this.marginX + 5 * this.cellWidth, this.marginY + 7 * this.cellHeight);
        this.ctx.lineTo(this.marginX + 3 * this.cellWidth, this.marginY + 9 * this.cellHeight);
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
                    this.marginX + move.x * this.cellWidth,
                    this.marginY + move.y * this.cellHeight,
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
        const centerX = this.marginX + x * this.cellWidth;
        const centerY = this.marginY + y * this.cellHeight;
        
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
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        // 计算点击位置相对于画布的坐标
        const canvasX = (event.clientX - rect.left) * scaleX;
        const canvasY = (event.clientY - rect.top) * scaleY;
        
        // 计算棋盘格子坐标，考虑边距
        const x = Math.floor((canvasX - this.marginX) / this.cellWidth);
        const y = Math.floor((canvasY - this.marginY) / this.cellHeight);
        
        console.log('点击位置:', {
            clientX: event.clientX,
            clientY: event.clientY,
            rect: rect,
            scaleX: scaleX,
            scaleY: scaleY,
            canvasX: canvasX,
            canvasY: canvasY,
            marginX: this.marginX,
            marginY: this.marginY,
            cellWidth: this.cellWidth,
            cellHeight: this.cellHeight,
            x: x,
            y: y
        });
        
        // 检查点击是否在棋盘范围内
        if (x < 0 || x >= 9 || y < 0 || y >= 10) {
            console.log('点击位置超出棋盘范围');
            return;
        }
        
        // 检查点击是否在棋子的有效范围内
        const pieceCenterX = this.marginX + x * this.cellWidth;
        const pieceCenterY = this.marginY + y * this.cellHeight;
        const distance = Math.sqrt(
            Math.pow(canvasX - pieceCenterX, 2) + 
            Math.pow(canvasY - pieceCenterY, 2)
        );
        
        if (distance > this.pieceSize / 2) {
            console.log('点击位置不在棋子范围内');
            return;
        }
        
        const clickedPiece = this.board[x][y];
        console.log('点击的棋子:', clickedPiece);
        
        if (this.selectedPiece) {
            // 尝试移动棋子
            const move = this.validMoves.find(m => m.x === x && m.y === y);
            if (move) {
                this.makeMove(this.selectedPiece.x, this.selectedPiece.y, x, y);
                this.selectedPiece = null;
                this.validMoves = [];
                this.isRedTurn = false;
                this.drawBoard();
                // 延迟 AI 移动，让玩家有时间看到自己的移动
                setTimeout(() => this.makeAIMove(), 500);
            } else if (clickedPiece && clickedPiece.color === 'red') {
                // 选择新的红方棋子
                this.selectedPiece = { x, y, piece: clickedPiece };
                this.validMoves = this.getValidMoves(x, y);
                console.log('选择新的红方棋子，有效移动:', this.validMoves);
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
            console.log('选择红方棋子，有效移动:', this.validMoves);
            this.drawBoard();
        }
    }
    
    getValidMoves(x, y) {
        const piece = this.board[x][y];
        if (!piece) return [];
        
        const moves = [];
        const type = piece.type;
        
        // 这里实现各种棋子的移动规则
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
}

// 初始化游戏
window.onload = () => {
    new ChessGame();
}; 