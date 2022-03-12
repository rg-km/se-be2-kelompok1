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
const MOVE_INTERVAL = 150;

function initPosition() {
    return {
        x: Math.floor(Math.random() * WIDTH),
        y: Math.floor(Math.random() * HEIGHT),
    }
}

function initHeadAndBody() {
    let head = initPosition();
    let body = [{x: head.x, y: head.y}];
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

function drawScore(snake) {
    let scoreCanvas;
    if (snake.color == snake1.color) {
        scoreCanvas = document.getElementById("score1Board");
    } else {
        scoreCanvas = document.getElementById("score2Board");
    }
    let scoreCtx = scoreCanvas.getContext("2d");

    scoreCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    scoreCtx.font = "30px Arial";
    scoreCtx.fillStyle = snake.color
    scoreCtx.fillText(snake.score, 10, scoreCanvas.scrollHeight / 2);
}

function draw() {
    setInterval(function() {
        let snakeCanvas = document.getElementById("snakeBoard");
        let ctx = snakeCanvas.getContext("2d");

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        
        drawCell(ctx, snake1.head.x, snake1.head.y, snake1.color, "snakeHeadIcon");
        for (let i = 1; i < snake1.body.length; i++) {
            drawCell(ctx, snake1.body[i].x, snake1.body[i].y, snake1.color);
        }
        //menampilkan apel
        for (let i = 0; i < apples.length; i++) {
            let apple = apples[i];
            showIcon(ctx,"apple",apple.position.x * CELL_SIZE, apple.position.y * CELL_SIZE, CELL_SIZE,CELL_SIZE);
        }

        if (checkPrim(snake1)) {
                drawCell(ctx, heart.position.x, heart.position.y, heart.color, "lifeIcon");
        }

        drawScore(snake1);
    }, REDRAW_INTERVAL);
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
            snake.body.push({x: snake.head.x, y: snake.head.y});
        } else if (snake.head.x == heart.position.x && snake.head.y == heart.position.y) {
            heart.position = initPosition();
            snake.score++;
            snake.life++;
            snake.body.push({x: snake.head.x, y: snake.head.y});
            console.log(snake.life);
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
                    isCollide = true;
                }
            }
        }
    }
    if (isCollide) {
        alert("Game over");
        snake1 = initSnake("purple");
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
        setTimeout(function() {
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

function initGame() {
    move(snake1);
}

initGame();