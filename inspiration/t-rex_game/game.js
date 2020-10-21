const $ = selector => {
    const elements = document.querySelectorAll(selector);
    return elements.length === 1 ? elements[0] : elements;
}

const randomIntInRange = (min, max) => Math.round(Math.random() * (max - min) + min);

const canvas = $('#game');
const ctx = canvas.getContext('2d');

let score, highscore, player, gravity, gameSpeed, scoreText, highScoreText, obstacles = [], keys = {};

// Event Listeners
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);


class Avatar {

    constructor(x, y, width, height, color) {

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.dy = 0;
        this.jumpForce = 15;
        this.jumpTimer = 0;
        this.originalHeight = height;

        this.grounded = false;

    }

    render() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.closePath();
    }

    jump() {

        if (this.grounded && this.jumpTimer === 0) {
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
        }

        else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);
        }

    }

    animate() {

        // Jump Animation
        if (keys['Space'] || keys['KeyW'] || keys['ArrowUp']) this.jump();
        else this.jumpTimer = 0;

        // Duck Animation
        if (keys['ShiftLeft'] || keys['KeyS'] || keys['ArrowDown']) this.height = this.originalHeight / 2;
        else this.height = this.originalHeight;

        // Apply Y directional FOrce
        this.y += this.dy;

        // Apply Gravity
        if (this.y + this.height < canvas.height) {
            this.dy += gravity;
            this.grounded = false;
        }

        else {
            this.dy = 0;
            this.grounded = true;
            this.y = canvas.height - this.height;
        }

        this.render();

    }

}


class Obstacle {

    constructor(x, y, width, height, color) {

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.dx = -gameSpeed;

    }

    animate() {
        this.x +=this.dx;
        this.render();
        this.dx = -gameSpeed;
    }

    render() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.closePath();
    }

}

class Text {
    constructor(textValue, x, y, alignment, color, size) {
        this.text = textValue;
        this.x = x;
        this.y = y;
        this.alignment = alignment;
        this.color = color;
        this.size = size;
    }

    render() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px sans-serif';
        ctx.textAlign = this.alignment;
        ctx.fillText(this.text, this.x, this.y);
        ctx.closePath();
    }
}

// Game Functions
const spawnObstacle = () => {

    let size = randomIntInRange(20, 70);
    let type = randomIntInRange(0, 1);
    let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, '#2484E4');
    
    if (type) obstacle.y -= player.originalHeight - 10;

    obstacles.push(obstacle);
}

const start = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.font = '20px sans-serif';

    gameSpeed = 3;
    gravity = 1;
    score = 0;
    highscore = sessionStorage.getItem('highscore') ?? 0;

    player = new Avatar(25, 0, 50, 50, '#FF5858');

    scoreText = new Text('Score: ' + score, 25, 25, 'left', '#333333', 20);

    highScoreText = new Text('High Score: ' + highscore, canvas.width - 25, 25, 'right', '#333');

    requestAnimationFrame(update);
}

let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;

const update = () => {

    requestAnimationFrame(update);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnTimer--;

    if (spawnTimer <= 0) {
        spawnObstacle();
        console.log(obstacles);
        spawnTimer = initialSpawnTimer - gameSpeed * 8;

        if (spawnTimer < 60) spawnTimer = 60;
    }

    // Spawn Obstacles
    obstacles.forEach((o, i, ary) => {
        o.animate();

        // Remove Obstacle Once it goes off screen
        if (o.x + o.width < 0) ary.splice(i, 1);

        if (
            player.x < o.x + o.width && 
            player.x + player.width > o.x &&
            player.y < o.y + o.height &&
            player.y + player.height > o.y
        ) {
            obstacles = [];
            score = 0;
            spawnTimer = initialSpawnTimer;
            gameSpeed = 3;
            sessionStorage.setItem('highscore', highscore);
        }
    });

    player.animate();

    // Update Score
    score++;

    // Update Score Text
    scoreText.text = 'Score: ' + score;

    if (score > highscore) {
        highscore = score;
        highScoreText.text = 'Highscore: ' + highscore;
    }

    // Render Score Text
    scoreText.render();
    highScoreText.render();

    gameSpeed += 0.003;
    
    
}

start();