// GLOBAL VARIABLES
let screens, game, canvas, ctx;
const keys = {};


// HELPER FUNCTIONS
const $ = selector => {

    let elements = document.querySelectorAll(selector);

    if (elements.length === 1) elements = elements[0];

    return elements;

}


const randomInt = (min, max) => Math.round(Math.random() * (max - min) + min);
const getRandomColor = () => `#${Math.floor(Math.random()*16777215).toString(16)}`;
const hide = element => element.style.display = 'none';
const show = element => element.style.display = 'block';





// Class Declararations
class CanvasItem {

    constructor(x, y, width, height, color, alignment) {

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.size = width;
        this.color = color || getRandomColor();
        this.alignment = alignment || 'left';
        this.isRect = false;

    }

    render() {

        ctx.beginPath();
        ctx.fillStyle = this.color;

        if (this.isRect) {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        else {
            ctx.font = `${this.size}px sans-serif`;
            ctx.textAlign = this.alignment;
            ctx.textBaseline = 'hanging';
            ctx.fillText(this.text, this.x, this.y);
        }

        ctx.closePath();
    }

}


class Player extends CanvasItem {

    constructor(emoji, size, gravity, jumpFocre, maxJumpForce) {

        super(25, 0, size, size);

        this.text = emoji;
        
        this.dy = 0;
        this.jumpFocre = jumpFocre;
        this.maxJumpForce = maxJumpForce;
        this.jumpTimer = 0;
        this.gravity = gravity;
        this.grounded = false;

    }

    jump() {

        if (this.grounded && !this.jumpTimer) {
            this.jumpTimer = 1;
            this.dy = -this.jumpFocre;
        }

        else if (this.jumpTimer > 0 && this.jumpTimer < this.maxJumpForce) {
            this.jumpTimer++;
            this.dy = -this.jumpFocre - (this.jumpTimer / 50);
        }

    }

    update() {

        if (keys['Space'] || keys['KeyW'] || keys['ArrowUp']) this.jump();
        else this.jumpTimer = 0;

        // Apply Y Directional Force
        this.y += this.dy;

        // Apply Gravity
        if (this.y + this.height < canvas.height) {
            this.dy += this.gravity;
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


class Obstacle extends CanvasItem {

    constructor(size, gameSpeed) {

        super(canvas.width + (size * .7), canvas.height - size, size * .7, size);

        this.isRect = true;
        this.dx = -gameSpeed;
        this.gameSpeed = gameSpeed;

    }

    update() {
        this.x += this.dx;
        this.render();
        this.dx -this.gameSpeed;
    }

}


class ScoreBoard extends CanvasItem {

    constructor(label, score, x, y, size, alignment, color) {

        super(x, y, size, size, color || '#333333', alignment);

        this.label = label;
        this.score = score;

    }

    update(score) {

        this.score = score;

        this.text = `${this.label}: ${this.score}`;

        this.render();

    }

}


class Game {

    constructor(options = {}) {

        this.avatar = options.avatar || '😀';
        
        this.gravity = options.gravity || 1;
        this.gameSpeed = options.gameSpeed || 3;
        this.jumpFocre = options.jumpFocre || 15;
        this.maxJumpForce = options.maxJumpForce || 25;

        this.initalSpawnTimer = options.spawnTimer || 200;
        this.spawnTimer = this.initalSpawnTimer;

        this.obstacles = [];

        this.score = 0;
        this.highScore = localStorage.getItem('highscore') || 0;

        this.isPlaying = true;

        // Initialize Canvas
        canvas = $('#game');
        ctx = canvas.getContext('2d');
        ctx.font = '20px sans-serif';

    }

    start() {

        // Update Canvas Size
        const ctn = $('.game__container');
        canvas.height = ctn.offsetHeight;
        canvas.width = ctn.offsetWidth;


        // Create Player
        this.player = new Player(this.avatar, 40, this.gravity, this.jumpFocre, this.maxJumpForce);


        // Create Scoreboards
        this.scoreboards = {
            main: new ScoreBoard('Score', this.score, 25, 25, 20),
            high: new ScoreBoard('High Score', this.highScore, canvas.width - 25, 25, 20, 'right')
        };


        // Begin Animating The Canvas
        requestAnimationFrame(() => this.animate());

    }

    animate() {

        // Clear the Canvas 
        ctx.clearRect(0, 0, canvas.width, canvas.height);


        // Update Obstacles
        this.updateObstacles();


        // Update Player
        this.player.update();


        // Update Score
        this.updateScore();


        // Continuously Animate Canvas
        if (this.isPlaying) requestAnimationFrame(() => this.animate());

    }

    updateObstacles() {

        this.spawnTimer--;

        if (this.spawnTimer <= 0) {
            this.spawnObstacle();

            this.spawnTimer = this.initalSpawnTimer - (this.gameSpeed * 8);

            if (this.spawnTimer < 60) this.spawnTimer = 60;
        }

        this.obstacles.forEach((o, i, ary) => {

            o.update();

            // Remove obstacle once it goes off screen
            if (o.x + o.width < 0) ary.splice(i, 1);

            const p = this.player;

            if (
                p.x < o.x + o.width &&
                p.x + p.width > o.x &&
                p.y < o.y + o.height &&
                p.y + p.height > o. y
            ) {
                this.end();
            }

        });

    }

    spawnObstacle() {

        const size = randomInt(20, 60);

        this.obstacles.push(new Obstacle(size, this.gameSpeed));

    }

    updateScore() {

        this.score++;

        if (this.score > this.highScore) this.highScore = this.score;

        this.scoreboards.main.update(this.score);
        this.scoreboards.high.update(this.highScore);

    }

    end() {

        // Stop Animations 
        this.isPlaying = false;


        // Update Score One Last Time
        this.updateScore();


        // Save High Score To Local Storage
        localStorage.setItem('highscore', this.highScore);


        // Update Results
        const resultsContainer = $('#results');
        resultsContainer.innerHTML = '';
        resultsContainer.insertAdjacentHTML('afterbegin', `<h2>Score: ${this.score}</h2><h3>High Score: ${this.highScore}</h3>`);


        // Display End Screen
        hide(screens.game);
        show(screens.end);

    }

}



// Initiazlize The Game
window.addEventListener('load', () => {

    // Define Our Screens
    screens = {
        start: $('#start-screen'),
        avatar: $('#avatar-picker'),
        game: $('#game-screen'),
        end: $('#end-screen')
    }


    // Move from welcome screen to avatar picker
    $('#start-screen button').addEventListener('click', () => {
        hide(screens.start);
        show(screens.avatar);
    });


    // Select Avatar
    $('.select-avatar').forEach(option => {

        option.addEventListener('click', event => {

            hide(screens.avatar);
            show(screens.game);

            // Start The Game
            game = new Game({ avatar: event.target.innerHTML });
            game.start();

        });

    });

    // Restart The Game
    $('#end-screen button').addEventListener('click', () => {

        hide(screens.end);
        show(screens.avatar);

    });


    // Attach Keyboard Events
    document.addEventListener('keydown', event => keys[event.code] = true);
    document.addEventListener('keyup', event => keys[event.code] = false);


    // Display High Score
    $('#high-score').innerHTML = localStorage.getItem('highscore') || 0;

});




