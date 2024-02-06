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
    constructor(x, y, size) {
        this.pos = { x: x, y: y };
        this.size = size;
        this.speed = PLAYER_SPEED;
    }

    move(dirX, dirY) {
        this.pos.x += dirX;
        this.pos.y += dirY;
    }

    draw() {
        ctx.fillStyle = "white";
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
    }

    update() {
        this.pos.x += this.dx;
        this.pos.y += this.dy;
        this.lifespan++;
    }

    draw() {
        ctx.fillStyle = this.getBulletColor();
        drawCircle(this.pos.x, this.pos.y, this.size);
    }

    isExpired() {
        return this.lifespan > BULLET_LIFESPAN;
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
let bullets = [];

gameLoop();

// Game stuff
function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

function updateGame() {
    if (keys["w"]) player.move(0, -player.speed); // Move up
    if (keys["s"]) player.move(0, player.speed); // Move down
    if (keys["a"]) player.move(-player.speed, 0); // Move left
    if (keys["d"]) player.move(player.speed, 0); // Move right

    bullets.forEach((bullet) => bullet.update());
    bullets = bullets.filter((bullet) => !bullet.isExpired());
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.draw();
    bullets.forEach((bullet) => bullet.draw());
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
