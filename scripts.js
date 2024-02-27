const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const $sprite = document.querySelector("#sprite");
const $brick1 = document.querySelector("#brick1");
const $brick2 = document.querySelector("#brick2");
const $brick3 = document.querySelector("#brick3");
const $brick4 = document.querySelector("#brick4");
const $brick1hit = document.querySelector("#brick1hit");
const $brick2hit = document.querySelector("#brick2hit");
const $brick3hit = document.querySelector("#brick3hit");
const $brick4hit = document.querySelector("#brick4hit");
const gameSign = document.querySelector("h1");
const startBtn = document.querySelector("#start-btn");
const modal = document.querySelector("#modal-start");
const animatedElements = document.querySelectorAll(".face,h5");
const restartBtn = document.querySelector("span");
const scoreTag = document.querySelector("h3");
const vel = document.querySelector("p");
let bricksDestroyed = 0;
let shadowCount = 0;
let counter = 0;
let score = 0;
let gameOver = false;

canvas.width = 379;
canvas.height = 520;

// Variables de la pelota
const ballRadius = 7;
let x = canvas.width / 2;
let y =  canvas.height - 25;
let shadowX1 = shadowX2 = shadowX3 = shadowX4 = x;
let shadowY1 = shadowY2 = shadowY3 = shadowY4 = y;
let dx = 0;
let dy = 0;
let ballStuck = true;

// Variables de la paleta
const padHeight = 16;
const padWidth = 86;
let padX = (canvas.width - padWidth) / 2;
let padY = canvas.height - padHeight - 10;
let lastPadY = padY;
let padYacel = 0;
let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let momentum = 0;

// Variables de los ladrillos
const brickRowCount = 7;
const brickColumnCount = 11;
const brickSide = 32;
const brickGap = 2;
const brickOffsetTop = 4;
const brickOffsetLeft = 4;
const bricks = [];

const BRICK_STATUS = {
    ACTIVE: 1,
    DESTROYED: 0
}

function initBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        // calculo de pos brick en pantalla
        for (let r = 0; r < brickRowCount; r++) {
            const brickX = c * (brickSide + brickGap) + brickOffsetLeft;
            const brickY = r * (brickSide + brickGap) + 
            brickOffsetTop;
            const random = Math.floor(Math.random() * 4) + 1;
            bricks[c][r] = {
                x: brickX, 
                dx: 0,
                y: brickY,
                dy: 0,
                status: BRICK_STATUS.ACTIVE, 
                type: random,
                prize: 36 * random,
                gravity: 0.1
            }
        }
    }
}

function drawBall() {
    if (ballStuck) {
        x = padX + (padWidth / 2)
    }
    ctx.beginPath();
    ctx.arc(shadowX4, shadowY4, ballRadius - 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(250,250,250,.35";
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(shadowX3, shadowY3, ballRadius - 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(250,250,250,.4)";
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(shadowX2, shadowY2, ballRadius - 1, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(250,250,250,.45";
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(shadowX1, shadowY1, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(250,250,250,.5)";
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(x, y, ballRadius + 2, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
}

function drawPad() {
    ctx.fillStyle = "#999";
    ctx.drawImage(
        $sprite,
        padX,
        padY,
        padWidth,
        padHeight
    )
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currBrick = bricks[c][r];
            if (currBrick.status === BRICK_STATUS.DESTROYED) {
                if (currBrick.y > canvas.height) {
                    continue;
                } else {
                    currBrick.dy = -0.5 * dy;
                    currBrick.y += currBrick.gravity + currBrick.dy;
                    currBrick.gravity += 0.4;
                }
            }
            currBrick.x += currBrick.dx;
            switch (currBrick.type) {
                case 1:
                    ctx.drawImage(
                        $brick1,
                        currBrick.x,
                        currBrick.y,
                        brickSide,
                        brickSide
                    );
                    break;
                case 2:
                    ctx.drawImage(
                        $brick2,
                        currBrick.x,
                        currBrick.y,
                        brickSide,
                        brickSide
                    );
                    break;
                case 3:
                    ctx.drawImage(
                        $brick3,
                        currBrick.x,
                        currBrick.y,
                        brickSide,
                        brickSide
                    );
                    break;
                case 4:
                    ctx.drawImage(
                        $brick4,
                        currBrick.x,
                        currBrick.y,
                        brickSide,
                        brickSide
                    );
                    break;
                case 5:
                    ctx.drawImage(
                        $brick1hit,
                        currBrick.x,
                        currBrick.y,
                        brickSide,
                        brickSide
                    );
                    break;
                case 6:
                    ctx.drawImage(
                        $brick2hit,
                        currBrick.x,
                        currBrick.y,
                        brickSide,
                        brickSide
                    );
                    break;
                case 7:
                    ctx.drawImage(
                        $brick3hit,
                        currBrick.x,
                        currBrick.y,
                        brickSide,
                        brickSide
                    );
                    break;
                case 8:
                    ctx.drawImage(
                        $brick4hit,
                        currBrick.x,
                        currBrick.y,
                        brickSide,
                        brickSide
                    );
                    break;
            }
             
        }
    }
}

function collisionDetection() {
    // Colisión paredes
    if (x + dx > canvas.width - ballRadius || 
        x + dx < ballRadius) {
        dx *= -1;
    };
    if (y + dy < ballRadius) {
        dy *= -1;
    };

    // Colisión pad-pelota
    const isBallSameXAsPad = (x > padX && x < padX + padWidth);
    const isBallTouchingPaddle = (y + dy > padY);

    if (isBallSameXAsPad && isBallTouchingPaddle) {
        dy = (dy * -1) - (score / 50000) - momentum;
        dx = dx + (Math.random() * 0.1 - 0.05);
        upPressed = false;
    }

    // Colisión pelota-piso
    if (y + dy > canvas.height - ballRadius) {
        gameSign.innerHTML = "GAME OVER";
        stopGame();
    }

    // Colisión pelota-ladrillo
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currBrick = bricks[c][r];
            if (currBrick.status === BRICK_STATUS.DESTROYED)
            continue;

            const isBallSameXAsBrick = 
                x >= currBrick.x &&
                x <= currBrick.x + brickSide;

            const isBallSameYAsBrick = 
                y >= currBrick.y &&
                y <= currBrick.y + brickSide;

            const isBallHittingLaterals =
                y - currBrick.y > 4 &&
                y - currBrick.y < 28; 

            if (isBallSameXAsBrick && isBallSameYAsBrick) {
                if (!isBallHittingLaterals) {
                    dy *= -1;
                } else {dx *= -1}
                currBrick.dx = dx * 2;
                currBrick.status = BRICK_STATUS.DESTROYED;
                bricksDestroyed++;
                currBrick.type += 4;
                score += currBrick.prize;
                scoreTag.innerHTML = score;
                checkWin();
            }             
        }
    }
}

function checkWin() {
    if (bricksDestroyed >= (brickColumnCount * brickRowCount)) {
        gameSign.innerHTML = "YOU WIN";
        stopGame();
    }
}

function ballMovement() {
    let rndX = 0;
    if (counter > 1000) {
        counter = 0;
    }
    if (counter % 90 == 0) {
        rndX = (Math.random() - 0.5) * ((score + 5000) / 7000);
    }
    if (dx == 0) {dx = 1}
    dx += rndX;
    x += dx;
    y += dy;
    
    if (!ballStuck) {
        counter++;
    }

    switch (shadowCount) {
        case 1:
            shadowX1 = x;
            shadowY1 = y;
            break;
        case 2:
            shadowX2 = shadowX1;
            shadowY2 = shadowY1;
            break;
        case 3:
            shadowX3 = shadowX2;
            shadowY3 = shadowY2;
            break;
        case 4:
            shadowX4 = shadowX3;
            shadowY4 = shadowY3;
            shadowCount = 0;
            break;
    }
    shadowCount++;
}

function paddleMovement() {
    if (rightPressed && padX < canvas.width - padWidth) {
        padX += 7 + (score / 2000);
    }
    if (leftPressed && padX > 0) {
        padX -= 7 + (score / 2000);
    }
    if (upPressed && padY > canvas.height / 1.5) {
        padY -= 1 - padYacel;
        padYacel -= 1;
    }
    if (!upPressed && padY <= canvas.height - padHeight - 10) {
        padY += 5;
        padYacel = 0;
    }
}

function cleanCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function initEvents() {
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    function keyDownHandler (event) {
        const { key } = event;
        if (key === 'Right' || key === 'ArrowRight') {
            rightPressed = true;
        } else if (key === 'Left' || key === 'ArrowLeft') {
            leftPressed = true;
        } else if (key === 'Down' ||
                    key === 'ArrowDown' && 
                    (dy == 0)) {
                        ballStuck = false;
                        dy = -2;
                        dx = Math.floor(Math.random() * 5) - 2;
                    } else if ((key === 'Up' || key === 'ArrowUp') && !ballStuck) {
                        upPressed = true;
                        momentum = 0.5;
                    }
    }

    function keyUpHandler (event) {
        const { key } = event;
        if (key === 'Right' || key === 'ArrowRight') {
            rightPressed = false;
        } else if (key === 'Left' || key === 'ArrowLeft') {
            leftPressed = false;
        } else if (key === 'Up' || key === 'ArrowUp') {
            upPressed = false;
            momentum = 0;
        }
    }
}

function stopGame() {
    dy = dx = 0;
    gameOver = true;
    gameSign.style.opacity = 1;
    restartBtn.style.opacity = 1;
    restartBtn.style.zIndex = 1;
    /*document.removeEventListener("keydown", keyDownHandler);
    document.removeEventListener("keyup", keyUpHandler);*/
}

function restartGame() {
    gameSign.style.opacity = 0;
    restartBtn.style.opacity = 0;
    restartBtn.style.zIndex = -1;
    bricksDestroyed = 0;
    shadowCount = 0;
    counter = 0;
    score = 0;
    gameOver = false;
    shadowX1 = shadowX2 = shadowX3 = shadowX4 = x;
    shadowY1 = shadowY2 = shadowY3 = shadowY4 = y;
    ballStuck = true;
    x = canvas.width / 2;
    y =  canvas.height - 30;
    initBricks();
    initEvents();
    draw();
}

function draw() {
    cleanCanvas();
    drawBricks();
    drawBall();
    drawPad();
    collisionDetection();
    ballMovement();
    paddleMovement();
    if (gameOver) return;
    window.requestAnimationFrame(draw);
}

function startGame() {
    initBricks();
    initEvents();
    startBtn.style.animation = "blink .3s linear infinite"
    modal.style.backgroundColor = "#fff";
    setTimeout(() => {
        modal.style.backgroundColor = "#111";
    }, 50);

    setTimeout(() => {
        animatedElements.forEach((elem) => {
            elem.style.animation = "none";
            elem.style.opacity = 0;
            elem.style.zIndex = -1;
        })
        modal.style.opacity = 0;
        modal.style.zIndex = -1;
        draw();
    }, 2000);
}

// Mobile control
document.addEventListener("touchstart", e => {
    padX = [...e.changedTouches][e.changedTouches.length - 1].pageX - (padWidth / 2);
    if (ballStuck) {
        ballStuck = false;
        dy = -2;
        dx = Math.floor(Math.random() * 5) - 2;
    }
})

document.addEventListener("touchmove", e => {
    padX = [...e.changedTouches][e.changedTouches.length - 1].pageX - (padWidth / 2);
    padX = Math.min(Math.max(0, padX), 379 - padWidth);
    let touchY = [...e.changedTouches][e.changedTouches.length - 1].pageY;
    if (touchY < lastPadY - 1) {
        upPressed = true;
    } else {upPressed = false}
    lastPadY = touchY;
})
