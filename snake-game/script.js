const CELL_SIZE = 20;
const CANVAS_SIZE = 400;
const REDRAW_INTERVAL = 50;
const WIDTH = CANVAS_SIZE / CELL_SIZE;
const HEIGHT = CANVAS_SIZE / CELL_SIZE;
const DIRECTION = {
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3,
}

let DEFAULT_LIFE = 3;
let MOVE_INTERVAL = 150;

const OBSTACLES = [
    {
        level: 1,
        obstacle: []
    },
    {
        level: 2,
        obstacle: [
            {
                position: {
                    x: 100,
                    y: 200,
                    width: 250,
                    height: 5,
                    color: "black",
                }
            },
        ]
    },
    {
        level: 3,
        obstacle: [
            {
                position: {
                    x: 100,
                    y: 50,
                    width: 5,
                    height: 300,
                    color: "black",
                }
            },
            {
                position: {
                    x: 300,
                    y: 50,
                    width: 5,
                    height: 300,
                    color: "black",
                }
            },
        ]
    },
    {
        level: 4,
        obstacle: [
            {
                position: {
                    x: 10,
                    y: 10,
                    width: 5,
                    height: 380,
                    color: "black",
                }
            },
            {
                position: {
                    x: 10,
                    y: 10,
                    width: 380,
                    height: 5,
                    color: "black",
                }
            },
        ]
    },
    {
        level: 5,
        obstacle: [
            {
                position: {
                    x: 5,
                    y: 200,
                    width: 390,
                    height: 5,
                    color: "black",
                }
            },
            {
                position: {
                    x: 200,
                    y: 5,
                    width: 5,
                    height: 390,
                    color: "black",
                }
            },
        ]
    },
]

const LEVELS = [
    { level: 1, speed: 150, },
    { level: 2, speed: 100, },
    { level: 3, speed: 90, },
    { level: 4, speed: 60, },
    { level: 5, speed: 50, },
];

function initPosition() {
    return {
        x: Math.floor(Math.random() * WIDTH),
        y: Math.floor(Math.random() * HEIGHT),
    }
}

function initHeadAndBody() {
    let head = initPosition();
    let body = [{ x: head.x, y: head.y }];
    return {
        head: head,
        body: body,
    }
}

function initDirection() {
    return Math.floor(Math.random() * 4);
}

function initSnake(color) {
    return {
        color: color,
        ...initHeadAndBody(),
        direction: initDirection(),
        life: DEFAULT_LIFE,
        level: 1,
        score: 0,
    }
}
let snake1 = initSnake("green");

let heart = {
    color: "blue",
    position: initPosition(),
}

let apples = [{
    color: "red",
    position: initPosition(),
},
{
    color: "red",
    position: initPosition(),
}]

const eatAppleSound = new Audio("assets/eat-apple.mp3");
const collideSound = new Audio("assets/collide.mp3");
const levelUpSound = new Audio("assets/level-up.wav");
const winSound = new Audio("assets/win.wav");
const gameOverSound = new Audio("assets/game-over.mp3");

//menampilkan gambar
function showIcon(ctx, path, x, y, width = 10, height = 10) {
    ctx.drawImage(document.getElementById(path), x, y, width, height);
}

function drawCell(ctx, x, y, color, img = null) {
    ctx.fillStyle = color;
    if (img == null) {
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    } else {
        showIcon(ctx, img, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
}
function drawSpeed(snake) {
    let speedCanvas;
    speedCanvas = document.getElementById("speed");
    let speedCtx = speedCanvas.getContext("2d");
    speedCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    speedCtx.font = "12px Arial";
    speedCtx.fillStyle = "black"
    for (var i = 0; i < LEVELS.length; i++) {
        if (snake.level == LEVELS[i].level) {
            speedCtx.fillText("Speed : "+LEVELS[i].speed, 10, speedCanvas.scrollHeight / 2);
        }
    }
}

function drawScore(snake) {
    let scoreCanvas;
    scoreCanvas = document.getElementById("score1Board");
    let scoreCtx = scoreCanvas.getContext("2d");

    scoreCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    scoreCtx.font = "12px Arial";
    scoreCtx.fillStyle = "black"
    scoreCtx.fillText("Score : " +snake.score, 10, scoreCanvas.scrollHeight / 2);
}

function draw() {
    setInterval(function () {
        if (snake1.score === 0) {
            drawLevel(snake1.score);
        }
        let snakeCanvas = document.getElementById("snakeBoard");
        let ctx = snakeCanvas.getContext("2d");

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        showObstacle(snake1);

        drawCell(ctx, snake1.head.x, snake1.head.y, snake1.color, "snakeHeadIcon2");
        for (let i = 1; i < snake1.body.length; i++) {
            drawCell(ctx, snake1.body[i].x, snake1.body[i].y, snake1.color, "body");
        }
        //menampilkan apel
        for (let i = 0; i < apples.length; i++) {
            let apple = apples[i];
            showIcon(ctx, "apple", apple.position.x * CELL_SIZE, apple.position.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }

        drawLife(snake1);
        drawScore(snake1);
        drawSpeed(snake1);
    }, REDRAW_INTERVAL);
}

function drawLife(snake) {
    let snakeCanvas = document.getElementById("snakeBoard");
    let ctx = snakeCanvas.getContext("2d");

    if (checkPrim(snake)) {
            drawCell(ctx, heart.position.x, heart.position.y, heart.color, "lifeIcon");
    }

    //menampilkan 3 nyawa
    for (var i = 0; i < snake.life; i++) {
        showIcon(ctx, "lifeIcon", 10 + (i * 20), 5, 20, 20);
    }
}

function resetSnake(snake) {
    return {
        color: snake.color,
        ...initHeadAndBody(),
        direction: initDirection(),
        score: snake.score,
        life: snake.life,
        level: snake.level,
    }
}

function teleport(snake) {
    if (snake.head.x < 0) {
        snake.head.x = CANVAS_SIZE / CELL_SIZE - 1;
    }
    if (snake.head.x >= WIDTH) {
        snake.head.x = 0;
    }
    if (snake.head.y < 0) {
        snake.head.y = CANVAS_SIZE / CELL_SIZE - 1;
    }
    if (snake.head.y >= HEIGHT) {
        snake.head.y = 0;
    }
}

function eat(snake, apples, heart) {
    for (let i = 0; i < apples.length; i++) {
        let apple = apples[i];
        if (snake.head.x == apple.position.x && snake.head.y == apple.position.y) {
            apple.position = initPosition();
            snake.score++;
            snake.body.push({ x: snake.head.x, y: snake.head.y });
            drawLevel(snake.score);
            eatAppleSound.play();
        } else if (snake.head.x == heart.position.x && snake.head.y == heart.position.y) {
            heart.position = initPosition();
            snake.score++;
            snake.life++;
            snake.body.push({ x: snake.head.x, y: snake.head.y });
            console.log(snake.life);
            drawLevel(snake.score);
            eatAppleSound.play();
        }
    }
}

function drawObstacle(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function showObstacle(snake) {
    let snakeCanvas = document.getElementById("snakeBoard");
    let ctx = snakeCanvas.getContext("2d");
    for (let i = 0; i < OBSTACLES.length; i++) {
        for (let j = 0; j < OBSTACLES[i].obstacle.length; j++) {
            if (snake.level == OBSTACLES[i].level) {
                if (OBSTACLES[i].obstacle.length > 0) {
                    ctx.fillStyle = OBSTACLES[i].obstacle[j].position.color;
                    drawObstacle(ctx, OBSTACLES[i].obstacle[j].position.x, OBSTACLES[i].obstacle[j].position.y, OBSTACLES[i].obstacle[j].position.width, OBSTACLES[i].obstacle[j].position.height, OBSTACLES[i].obstacle[j].color);
                }
            }
        }
    }
}

function moveLeft(snake) {
    snake.head.x--;
    teleport(snake);
    eat(snake, apples, heart);
}

function moveRight(snake) {
    snake.head.x++;
    teleport(snake);
    eat(snake, apples, heart);
}

function moveDown(snake) {
    snake.head.y++;
    teleport(snake);
    eat(snake, apples, heart);
}

function moveUp(snake) {
    snake.head.y--;
    teleport(snake);
    eat(snake, apples, heart);
}

function checkCollision(snakes) {
    let isCollide = false;
    //this
    for (let i = 0; i < snakes.length; i++) {
        for (let j = 0; j < snakes.length; j++) {
            for (let k = 1; k < snakes[j].body.length; k++) {
                if (snakes[i].head.x == snakes[j].body[k].x && snakes[i].head.y == snakes[j].body[k].y) {
                    collideSound.play();
                    isCollide = true;
                }
            }
        }
    }

    //nabrak tembok
    for (let i = 0; i < OBSTACLES.length; i++) {
        for (let j = 0; j < OBSTACLES[i].obstacle.length; j++) {
            if (snake1.level == OBSTACLES[i].level && OBSTACLES[i].obstacle.length > 0) {
                if (snake1.head.x >= (Math.floor(OBSTACLES[i].obstacle[j].position.x / CELL_SIZE)) && snake1.head.y >= (Math.floor(OBSTACLES[i].obstacle[j].position.y / CELL_SIZE))
                    && snake1.head.y <= (Math.floor(OBSTACLES[i].obstacle[j].position.height / HEIGHT)) + Math.floor(OBSTACLES[i].obstacle[j].position.y / CELL_SIZE)
                    && snake1.head.x < (Math.floor(OBSTACLES[i].obstacle[j].position.x / CELL_SIZE) + Math.ceil(OBSTACLES[i].obstacle[j].position.width / WIDTH))) {
                    collideSound.play();
                    isCollide = true;
                }
            }
        }
    }

    if (isCollide) {
        if (snake1.life === 1) {
            gameOverSound.play();
            alert("Game over");
            snake1 = initSnake("green");
        } else {
            //mengurangi nyawa
            snake1.life--;
            snake1 = resetSnake(snake1);
        }
    }
    return isCollide;
}

function move(snake) {
    switch (snake.direction) {
        case DIRECTION.LEFT:
            moveLeft(snake);
            break;
        case DIRECTION.RIGHT:
            moveRight(snake);
            break;
        case DIRECTION.DOWN:
            moveDown(snake);
            break;
        case DIRECTION.UP:
            moveUp(snake);
            break;
    }
    moveBody(snake);
    if (!checkCollision([snake1])) {
        setTimeout(function () {
            move(snake);
        }, MOVE_INTERVAL);
    } else {
        initGame();
    }
}

function moveBody(snake) {
    snake.body.unshift({ x: snake.head.x, y: snake.head.y });
    snake.body.pop();
}

function turn(snake, direction) {
    const oppositeDirections = {
        [DIRECTION.LEFT]: DIRECTION.RIGHT,
        [DIRECTION.RIGHT]: DIRECTION.LEFT,
        [DIRECTION.DOWN]: DIRECTION.UP,
        [DIRECTION.UP]: DIRECTION.DOWN,
    }

    if (direction !== oppositeDirections[snake.direction]) {
        snake.direction = direction;
    }
}

document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
        turn(snake1, DIRECTION.LEFT);
    } else if (event.key === "ArrowRight") {
        turn(snake1, DIRECTION.RIGHT);
    } else if (event.key === "ArrowUp") {
        turn(snake1, DIRECTION.UP);
    } else if (event.key === "ArrowDown") {
        turn(snake1, DIRECTION.DOWN);
    }

})

function checkPrim(snake) {
    let score = snake.score;
    let dibagi = 0;
    for (let i = 0; i <= score; i++) {
        if (score % i == 0) {
            dibagi = dibagi + 1;
        }
    }

    if (dibagi == 2) {
        return true;
    } else {
        return false;
    }
}

function drawLevel(score) {
    // console.log(score);
    let levelCanvas = document.getElementById("levels");
    let levelCtx = levelCanvas.getContext("2d");
    if (score == 0) {
        levelCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        levelCtx.font = "12px Arial";
        levelCtx.fillStyle = "black"
        levelCtx.fillText("🏆️ Level : " + snake1.level, 10, levelCanvas.scrollHeight / 2);
    } else if ((score % 5) == 0) {
        snake1.level++;
        levelCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        levelCtx.font = "12px Arial";
        levelCtx.fillStyle = "black"
        levelCtx.fillText("🏆️ Level : " + snake1.level, 10, levelCanvas.scrollHeight / 2);
        if (snake1.level <= 5) {
            levelUpSound.play();
            alert("level up");
        } else {
            winSound.play();
            alert("Win");
            snake1 = initSnake("green");
            initGame();
        }
    }
    for (var i = 0; i < LEVELS.length; i++) {
        if (snake1.level == LEVELS[i].level) {
            MOVE_INTERVAL = LEVELS[i].speed;
        }
    }
}


function initGame() {
    move(snake1);
}

initGame();