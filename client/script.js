const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Canvas sizing stuff
const ERROR_BROWSER_SIZE = 4;
const devicePixelRatio = window.devicePixelRatio || 1;

canvas.width = (window.innerWidth - ERROR_BROWSER_SIZE) * devicePixelRatio;
canvas.height = (window.innerHeight - ERROR_BROWSER_SIZE) * devicePixelRatio;
canvas.style.width = window.innerWidth - ERROR_BROWSER_SIZE + "px";
canvas.style.height = window.innerHeight - ERROR_BROWSER_SIZE + "px";

ctx.scale(devicePixelRatio, devicePixelRatio);

// Player stuff
class Player {
    constructor(x, y, size, isEnemy = false) {
        this.pos = { x: x, y: y };
        this.size = size;
        this.speed = PLAYER_SPEED;
        this.isEnemy = isEnemy;
    }

    move(dirX, dirY) {
        this.pos.x += dirX;
        this.pos.y += dirY;
    }

    draw() {
        ctx.fillStyle = this.isEnemy ? "blue" : "white";
        drawCircle(this.pos.x, this.pos.y, this.size);
    }
}

// Bullet stuff
class Bullet {
    constructor(x, y, angle, size) {
        this.pos = { x: x, y: y };
        this.speed = BULLET_SPEED;
        this.angle = angle;
        this.size = size;
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
        this.lifespan = 0;
        this.isExpired = false;
    }

    update() {
        this.pos.x += this.dx;
        this.pos.y += this.dy;
        this.lifespan++;

        if (this.lifespan > BULLET_LIFESPAN) {
            this.isExpired = true;
        }
    }

    draw() {
        ctx.fillStyle = this.getBulletColor();
        drawCircle(this.pos.x, this.pos.y, this.size);
    }

    getBulletColor() {
        if (this.lifespan < BULLET_LIFESPAN / 3) {
            return "white";
        } else if (this.lifespan < (BULLET_LIFESPAN / 3) * 2) {
            return "yellow";
        } else {
            return "red";
        }
    }
}

// Init stuff
const keys = {};
const PLAYER_SIZE = 50;
const PLAYER_SPEED = 5;

const BULLET_SIZE = 5;
const BULLET_SPEED = 10;
const BULLET_LIFESPAN = 100;

const player = new Player(
    window.innerWidth / 2,
    window.innerHeight / 2,
    PLAYER_SIZE
);
let enemies = [];
let bullets = [];

for (let i = 0; i < 10; i++) {
    createEnemy();
}

gameLoop();

// Game stuff
function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

function updateGame() {
    if (keys["w"]) moveWorld(0, -player.speed);
    if (keys["s"]) moveWorld(0, player.speed);
    if (keys["a"]) moveWorld(-player.speed, 0);
    if (keys["d"]) moveWorld(player.speed, 0);

    bullets.forEach((bullet) => {
        bullet.update();
        enemies.forEach((enemy, enemyIndex) => {
            if (isColliding(bullet, enemy)) {
                enemies.splice(enemyIndex, 1);
                bullet.isExpired = true;

                createEnemy();
            }
        });
    });

    bullets = bullets.filter((bullet) => !bullet.isExpired);
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.draw();
    bullets.forEach((bullet) => bullet.draw());
    enemies.forEach((enemy) => enemy.draw());
}

function createEnemy() {
    const enemy = new Player(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight,
        PLAYER_SIZE / 2,
        true
    );

    enemies.push(enemy);
}

// Game logistics
function moveWorld(dx, dy) {
    bullets.forEach((bullet) => {
        bullet.pos.x -= dx;
        bullet.pos.y -= dy;
    });

    enemies.forEach((enemy) => {
        enemy.pos.x -= dx;
        enemy.pos.y -= dy;
    });
}

function isColliding(circle1, circle2) {
    var dx = circle1.pos.x - circle2.pos.x;
    var dy = circle1.pos.y - circle2.pos.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    return distance < circle1.size + circle2.size;
}

// Drawing stuff
function drawCircle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

// Events stuff
window.addEventListener("keydown", function (e) {
    keys[e.key] = true;
});

window.addEventListener("keyup", function (e) {
    keys[e.key] = false;
});

window.addEventListener("click", (e) => {
    const angle = Math.atan2(
        e.clientY - player.pos.y,
        e.clientX - player.pos.x
    );
    const bullet = new Bullet(player.pos.x, player.pos.y, angle, BULLET_SIZE);
    bullets.push(bullet);
});
