class ChessGame {
    constructor() {
        this.canvas = document.getElementById('chess-board');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置棋盘尺寸
        this.boardWidth = 320;  // 棋盘实际宽度
        this.boardHeight = 360; // 棋盘实际高度
        this.cellWidth = this.boardWidth / 8;  // 格子宽度
        this.cellHeight = this.boardHeight / 9; // 格子高度
        this.pieceSize = Math.min(this.cellWidth, this.cellHeight) * 0.85; // 增大棋子尺寸
        
        // 设置边距，确保棋盘居中
        this.marginX = (this.canvas.width - this.boardWidth) / 2;
        this.marginY = (this.canvas.height - this.boardHeight) / 2;
        
        // 初始化棋盘状态
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.validMoves = [];
        this.isRedTurn = true;
        this.gameHistory = [];
        
        // 动画相关
        this.animatingPiece = null;
        this.animationStart = null;
        this.animationDuration = 300; // 300ms
        
        // 绑定事件
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        document.getElementById('start-game').addEventListener('click', this.startNewGame.bind(this));
        document.getElementById('undo-move').addEventListener('click', this.undoMove.bind(this));
        
        // 开始动画循环
        this.animate();
        
        // 开始新游戏
        this.startNewGame();
    }
    
    animate(currentTime) {
        if (this.animatingPiece) {
            if (!this.animationStart) {
                this.animationStart = currentTime;
            }
            
            const elapsed = currentTime - this.animationStart;
            const progress = Math.min(elapsed / this.animationDuration, 1);
            
            // 使用缓动函数使动画更自然
            const easeProgress = this.easeInOutQuad(progress);
            
            // 计算当前位置
            const startX = this.marginX + this.animatingPiece.startX * this.cellWidth;
            const startY = this.marginY + this.animatingPiece.startY * this.cellHeight;
            const endX = this.marginX + this.animatingPiece.endX * this.cellWidth;
            const endY = this.marginY + this.animatingPiece.endY * this.cellHeight;
            
            const currentX = startX + (endX - startX) * easeProgress;
            const currentY = startY + (endY - startY) * easeProgress;
            
            // 重绘棋盘
            this.drawBoard();
            
            // 绘制移动中的棋子
            if (progress < 1) {
                this.drawAnimatingPiece(currentX, currentY);
                requestAnimationFrame(this.animate.bind(this));
            } else {
                // 动画结束
                this.animatingPiece = null;
                this.animationStart = null;
                this.drawBoard();
                
                // 完成移动后切换回合
                this.isRedTurn = !this.isRedTurn;
                if (!this.isRedTurn) {
                    setTimeout(() => this.makeAIMove(), 500);
                }
            }
        } else {
            requestAnimationFrame(this.animate.bind(this));
        }
    }
    
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    drawAnimatingPiece(x, y) {
        const piece = this.animatingPiece.piece;
        
        // 绘制棋子背景
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.pieceSize / 2, 0, Math.PI * 2);
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
        this.ctx.fillText(piece.type, x, y);
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
        
        // 如果是选中的棋子，绘制选中效果
        if (this.selectedPiece && this.selectedPiece.x === x && this.selectedPiece.y === y) {
            // 绘制选中状态的光晕效果
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, this.pieceSize / 1.8, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            this.ctx.fill();
        }
        
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
        if (!this.isRedTurn || this.animatingPiece) return; // 动画过程中不响应点击
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        // 计算点击位置相对于画布的坐标
        const canvasX = (event.clientX - rect.left) * scaleX;
        const canvasY = (event.clientY - rect.top) * scaleY;
        
        // 计算棋盘格子坐标，考虑边距
        const x = Math.floor((canvasX - this.marginX) / this.cellWidth);
        const y = Math.floor((canvasY - this.marginY) / this.cellHeight);
        
        // 检查点击是否在棋盘范围内
        if (x < 0 || x >= 9 || y < 0 || y >= 10) {
            console.log('点击位置超出棋盘范围');
            return;
        }
        
        const clickedPiece = this.board[x][y];
        
        // 如果点击的是有效移动位置，直接处理移动
        if (this.selectedPiece) {
            const move = this.validMoves.find(m => m.x === x && m.y === y);
            if (move) {
                // 开始移动动画
                this.animatingPiece = {
                    piece: this.selectedPiece.piece,
                    startX: this.selectedPiece.x,
                    startY: this.selectedPiece.y,
                    endX: x,
                    endY: y
                };
                
                // 更新棋盘状态
                this.makeMove(this.selectedPiece.x, this.selectedPiece.y, x, y);
                this.selectedPiece = null;
                this.validMoves = [];
                return;
            }
        }
        
        // 如果点击的是同一个棋子，取消选中
        if (this.selectedPiece && this.selectedPiece.x === x && this.selectedPiece.y === y) {
            this.selectedPiece = null;
            this.validMoves = [];
            this.drawBoard();
            return;
        }
        
        // 如果点击的是红方棋子，选中它
        if (clickedPiece && clickedPiece.color === 'red') {
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
                // 车的移动规则：直线移动，直到遇到棋子
                // 横向移动
                for (let i = x - 1; i >= 0; i--) {
                    if (this.board[i][y]) {
                        if (this.board[i][y].color !== piece.color) {
                            moves.push({ x: i, y });
                        }
                        break;
                    }
                    moves.push({ x: i, y });
                }
                for (let i = x + 1; i < 9; i++) {
                    if (this.board[i][y]) {
                        if (this.board[i][y].color !== piece.color) {
                            moves.push({ x: i, y });
                        }
                        break;
                    }
                    moves.push({ x: i, y });
                }
                // 纵向移动
                for (let i = y - 1; i >= 0; i--) {
                    if (this.board[x][i]) {
                        if (this.board[x][i].color !== piece.color) {
                            moves.push({ x, y: i });
                        }
                        break;
                    }
                    moves.push({ x, y: i });
                }
                for (let i = y + 1; i < 10; i++) {
                    if (this.board[x][i]) {
                        if (this.board[x][i].color !== piece.color) {
                            moves.push({ x, y: i });
                        }
                        break;
                    }
                    moves.push({ x, y: i });
                }
                break;
                
            case '炮':
                // 炮的移动规则：直线移动，吃子时需要跳过一个棋子
                // 横向移动
                let hasPiece = false;
                for (let i = x - 1; i >= 0; i--) {
                    if (this.board[i][y]) {
                        if (hasPiece && this.board[i][y].color !== piece.color) {
                            moves.push({ x: i, y });
                        }
                        hasPiece = true;
                    } else if (!hasPiece) {
                        moves.push({ x: i, y });
                    }
                }
                hasPiece = false;
                for (let i = x + 1; i < 9; i++) {
                    if (this.board[i][y]) {
                        if (hasPiece && this.board[i][y].color !== piece.color) {
                            moves.push({ x: i, y });
                        }
                        hasPiece = true;
                    } else if (!hasPiece) {
                        moves.push({ x: i, y });
                    }
                }
                // 纵向移动
                hasPiece = false;
                for (let i = y - 1; i >= 0; i--) {
                    if (this.board[x][i]) {
                        if (hasPiece && this.board[x][i].color !== piece.color) {
                            moves.push({ x, y: i });
                        }
                        hasPiece = true;
                    } else if (!hasPiece) {
                        moves.push({ x, y: i });
                    }
                }
                hasPiece = false;
                for (let i = y + 1; i < 10; i++) {
                    if (this.board[x][i]) {
                        if (hasPiece && this.board[x][i].color !== piece.color) {
                            moves.push({ x, y: i });
                        }
                        hasPiece = true;
                    } else if (!hasPiece) {
                        moves.push({ x, y: i });
                    }
                }
                break;
                
            case '马':
                // 马的移动规则：日字，需要考虑蹩马腿
                const horseMoves = [
                    { dx: 1, dy: 2, legX: 0, legY: 1 },   // 右二下一
                    { dx: 2, dy: 1, legX: 1, legY: 0 },   // 右一下二
                    { dx: 2, dy: -1, legX: 1, legY: 0 },  // 右一上二
                    { dx: 1, dy: -2, legX: 0, legY: -1 }, // 右二上一
                    { dx: -1, dy: -2, legX: 0, legY: -1 },// 左二上一
                    { dx: -2, dy: -1, legX: -1, legY: 0 },// 左一上二
                    { dx: -2, dy: 1, legX: -1, legY: 0 }, // 左一下二
                    { dx: -1, dy: 2, legX: 0, legY: 1 }   // 左二下一
                ];
                
                horseMoves.forEach(move => {
                    const newX = x + move.dx;
                    const newY = y + move.dy;
                    const legX = x + move.legX;
                    const legY = y + move.legY;
                    
                    // 检查目标位置是否在棋盘内
                    if (newX >= 0 && newX < 9 && newY >= 0 && newY < 10) {
                        // 检查蹩马腿位置是否有棋子
                        if (!this.board[legX][legY]) {
                            // 检查目标位置是否有己方棋子
                            const targetPiece = this.board[newX][newY];
                            if (!targetPiece || targetPiece.color !== piece.color) {
                                moves.push({ x: newX, y: newY });
                            }
                        }
                    }
                });
                break;
                
            case '相':
            case '象':
                // 相/象的移动规则：田字，不能过河，需要考虑象眼
                const elephantMoves = [
                    { dx: 2, dy: 2, eyeX: 1, eyeY: 1 },   // 右下
                    { dx: 2, dy: -2, eyeX: 1, eyeY: -1 },  // 右上
                    { dx: -2, dy: -2, eyeX: -1, eyeY: -1 },// 左上
                    { dx: -2, dy: 2, eyeX: -1, eyeY: 1 }   // 左下
                ];
                
                elephantMoves.forEach(move => {
                    const newX = x + move.dx;
                    const newY = y + move.dy;
                    const eyeX = x + move.eyeX;
                    const eyeY = y + move.eyeY;
                    
                    // 检查目标位置是否在棋盘内
                    if (newX >= 0 && newX < 9 && newY >= 0 && newY < 10) {
                        // 检查是否过河（相/象不能过河）
                        if ((piece.type === '相' && newY >= 5) || 
                            (piece.type === '象' && newY <= 4)) {
                            // 检查象眼位置是否有棋子
                            if (!this.board[eyeX][eyeY]) {
                                // 检查目标位置是否有己方棋子
                                const targetPiece = this.board[newX][newY];
                                if (!targetPiece || targetPiece.color !== piece.color) {
                                    moves.push({ x: newX, y: newY });
                                }
                            }
                        }
                    }
                });
                break;
                
            case '士':
            case '仕':
                // 士/仕的移动规则：斜线，只能在九宫格内移动
                const advisorMoves = [
                    { dx: 1, dy: 1 },   // 右下
                    { dx: 1, dy: -1 },  // 右上
                    { dx: -1, dy: -1 }, // 左上
                    { dx: -1, dy: 1 }   // 左下
                ];
                
                advisorMoves.forEach(move => {
                    const newX = x + move.dx;
                    const newY = y + move.dy;
                    
                    // 检查是否在九宫格内
                    if (newX >= 3 && newX <= 5) {
                        if ((piece.type === '士' && newY >= 7 && newY <= 9) || 
                            (piece.type === '仕' && newY >= 0 && newY <= 2)) {
                            // 检查目标位置是否有己方棋子
                            const targetPiece = this.board[newX][newY];
                            if (!targetPiece || targetPiece.color !== piece.color) {
                                moves.push({ x: newX, y: newY });
                            }
                        }
                    }
                });
                break;
                
            case '帅':
            case '将':
                // 帅/将的移动规则：直线，只能在九宫格内移动
                const kingMoves = [
                    { dx: 0, dy: 1 },   // 下
                    { dx: 0, dy: -1 },  // 上
                    { dx: 1, dy: 0 },   // 右
                    { dx: -1, dy: 0 }   // 左
                ];
                
                kingMoves.forEach(move => {
                    const newX = x + move.dx;
                    const newY = y + move.dy;
                    
                    // 检查是否在九宫格内
                    if (newX >= 3 && newX <= 5) {
                        if ((piece.type === '帅' && newY >= 7 && newY <= 9) || 
                            (piece.type === '将' && newY >= 0 && newY <= 2)) {
                            // 检查目标位置是否有己方棋子
                            const targetPiece = this.board[newX][newY];
                            if (!targetPiece || targetPiece.color !== piece.color) {
                                moves.push({ x: newX, y: newY });
                            }
                        }
                    }
                });
                break;
                
            case '兵':
            case '卒':
                // 兵/卒的移动规则：过河前只能向前，过河后可以左右移动
                const pawnMoves = [];
                
                if (piece.type === '兵') {
                    // 红方兵
                    if (y > 0) {
                        pawnMoves.push({ x, y: y - 1 }); // 向前
                    }
                    if (y <= 4) { // 过河后
                        if (x > 0) pawnMoves.push({ x: x - 1, y }); // 向左
                        if (x < 8) pawnMoves.push({ x: x + 1, y }); // 向右
                    }
                } else {
                    // 黑方卒
                    if (y < 9) {
                        pawnMoves.push({ x, y: y + 1 }); // 向前
                    }
                    if (y >= 5) { // 过河后
                        if (x > 0) pawnMoves.push({ x: x - 1, y }); // 向左
                        if (x < 8) pawnMoves.push({ x: x + 1, y }); // 向右
                    }
                }
                
                pawnMoves.forEach(move => {
                    const targetPiece = this.board[move.x][move.y];
                    if (!targetPiece || targetPiece.color !== piece.color) {
                        moves.push(move);
                    }
                });
                break;
        }
        
        return moves;
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