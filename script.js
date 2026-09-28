const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');

// Game variables
const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 8;
const paddleSpeed = 6;
const ballSpeedInitial = 5;

let playerScore = 0;
let computerScore = 0;
let ballSpeed = ballSpeedInitial;

// Player paddle (left side)
const player = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: paddleSpeed
};

// Computer paddle (right side)
const computer = {
    x: canvas.width - paddleWidth - 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: paddleSpeed * 0.85 // Slightly slower than player for balance
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: ballSpeedInitial,
    dy: ballSpeedInitial,
    speed: ballSpeedInitial
};

// Keyboard input tracking
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse tracking for player paddle
let mouseY = canvas.height / 2;
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player position
function updatePlayer() {
    const moveUp = keys['ArrowUp'] || keys['w'] || keys['W'];
    const moveDown = keys['ArrowDown'] || keys['s'] || keys['S'];
    
    // Mouse control (smooth following)
    const mouseTarget = mouseY - player.height / 2;
    const distance = mouseTarget - player.y;
    
    if (Math.abs(distance) > 5) {
        player.y += distance * 0.15; // Smooth movement
    }
    
    // Keyboard override for precise control
    if (moveUp) {
        player.y -= player.speed;
    }
    if (moveDown) {
        player.y += player.speed;
    }
    
    // Collision with walls
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

// Update computer AI
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    
    // Simple AI: follow the ball
    const diff = ballCenter - computerCenter;
    
    if (diff < -35) {
        computer.y -= computer.speed;
    } else if (diff > 35) {
        computer.y += computer.speed;
    } else {
        // Small deadzone for AI to seem more natural
        computer.y += diff * 0.1;
    }
    
    // Collision with walls
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom collision
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.size < 0 ? ball.size : canvas.height - ball.size;
    }
    
    // Paddle collision
    checkPaddleCollision(player);
    checkPaddleCollision(computer);
    
    // Scoring
    if (ball.x - ball.size < 0) {
        computerScore++;
        computerScoreDisplay.textContent = computerScore;
        resetBall();
    }
    if (ball.x + ball.size > canvas.width) {
        playerScore++;
        playerScoreDisplay.textContent = playerScore;
        resetBall();
    }
}

// Check collision between ball and paddle
function checkPaddleCollision(paddle) {
    // Check if ball is at the paddle's x position
    if (ball.dx > 0 && paddle === computer) {
        if (ball.x + ball.size >= paddle.x &&
            ball.x - ball.size <= paddle.x + paddle.width &&
            ball.y >= paddle.y &&
            ball.y <= paddle.y + paddle.height) {
            ball.dx = -ball.dx;
            ball.x = paddle.x - ball.size;
            
            // Add spin based on where the ball hit the paddle
            const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
            ball.dy += hitPos * 3;
            
            // Increase ball speed slightly
            ball.speed = Math.min(ball.speed + 0.5, ballSpeedInitial * 2);
            ball.dx *= (ball.speed / ballSpeedInitial);
            ball.dy *= (ball.speed / ballSpeedInitial);
        }
    } else if (ball.dx < 0 && paddle === player) {
        if (ball.x - ball.size <= paddle.x + paddle.width &&
            ball.x + ball.size >= paddle.x &&
            ball.y >= paddle.y &&
            ball.y <= paddle.y + paddle.height) {
            ball.dx = -ball.dx;
            ball.x = paddle.x + paddle.width + ball.size;
            
            // Add spin based on where the ball hit the paddle
            const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
            ball.dy += hitPos * 3;
            
            // Increase ball speed slightly
            ball.speed = Math.min(ball.speed + 0.5, ballSpeedInitial * 2);
            ball.dx *= (ball.speed / ballSpeedInitial);
            ball.dy *= (ball.speed / ballSpeedInitial);
        }
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = ballSpeedInitial;
    ball.dx = ballSpeedInitial * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ballSpeedInitial * (Math.random() - 0.5);
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'rgba(0, 255, 136, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'transparent';
}

function drawBall() {
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'rgba(255, 107, 107, 0.6)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
}

function drawCenterLine() {
    ctx.strokeStyle = '#00ff88';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawCenterLine();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
}

// Game loop
function gameLoop() {
    updatePlayer();
    updateComputer();
    updateBall();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();