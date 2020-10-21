// HELPER FUNCTIONS & Global Variables
const keys = {};
let game;

// Shortcut for document.queryselector
const $ = selector => {

    const elements = document.querySelectorAll(selector);
    return elements.length === 1 ? elements[0] : elements;

}

// Generate a random color
const getRandomColor = () => {
    return `#${Math.floor(Math.random()*16777215).toString(16)}`;
}

// Generate a random integer in a range
const randomInt = (min = 0, max = 1) => Math.round(Math.random() * (max - min) + min);

// Shortcut To Set Display To Block
const show = element => element.style.display = 'block';
const hide = element => element.style.display = 'none';



// CLASS DECLARATIONS

class CanvasItem {

    constructor(ctx, canvas, x, y, width, height, color, alignment) {

        this.ctx = ctx;
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.size = height;
        this.width = width;
        this.height = height;
        this.color = color ?? getRandomColor();
        this.alignment = alignment || 'left';
        this.isRectangle = false;

    }

    render() {

        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;

        if (this.isRectangle) this.ctx.fillRect(this.x, this.y, this.width, this.height);
        else {
            this.ctx.font = `${this.size}px sans-serif`;
            this.ctx.textAlign = this.alignment;
            this.ctx.textBaseline = 'hanging';
            this.ctx.fillText(this.text, this.x, this.y);
        }
        
        this.ctx.closePath();


    }

}


class Player extends CanvasItem {

    constructor(ctx, canvas, emoji, size, gravity, jumpForce, maxJumpForce) {

        super(ctx, canvas, 25, 0, size, size);

        this.text = emoji;

        this.dy = 0;
        this.jumpForce = jumpForce;
        this.maxJumpForce = maxJumpForce;
        this.jumpTimer = 0;
        this.gravity = gravity;

        this.grounded = true;
    }


    jump() {

        if (this.grounded && !this.jumpTimer) {
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
        }

        else if (this.jumpTimer > 0 && this.jumpTimer < this.maxJumpForce) {
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);
        }

    }


    update() {

        // Detect And Apply Jump Animation
        if (keys['Space'] || keys['KeyW'] || keys['ArrowUp']) this.jump();
        else this.jumpTimer = 0;


        // Apply Y Directional Force
        this.y += this.dy;


        // Apply Gravity
        if (this.y + this.height < this.canvas.height) {
            this.dy += this.gravity;
            this.grounded = false;
        }
        
        else {
            this.dy = 0;
            this.grounded = true;
            this.y = this.canvas.height - this.height;
        }


        // Render Updated Placement
        this.render();

    }

}


class Obstacle extends CanvasItem {
    constructor(ctx, canvas, gameSpeed, x, y, width, height, color) {

        super(ctx, canvas, x, y, width, height, color);

        this.isRectangle = true;
        this.dx = -gameSpeed;
        this.gameSpeed = gameSpeed;

    }

    update() {
        this.x += this.dx;
        this.render();
        this.dx = -this.gameSpeed;
    }
}


class ScoreBoard extends CanvasItem {

    constructor(ctx, canvas, score, text, x, y, size, alignment, color) {
        super(ctx, canvas, x, y, size, size, color || '#333333', alignment);
        this.score = score;
        this.scoreText = text;
    }

    update(score) {
        this.score = score;
        this.text = `${this.scoreText}: ${this.score}`;
        this.render();
    }

}


class Game {

    constructor(props) {

        this.avatar = props.avatar || '😏';

        this.gravity = props.gravity || 1;
        this.initialGameSpeed = props.gameSpeed || 3;
        this.gameSpeed = this.initialGameSpeed;
        this.jumpForce = props.jumpForce || 15;
        this.maxJumpForce = props.maxJumpForce || 25;

        this.initialSpawnTimer = props.spawnTimer || 200;
        this.spawnTimer = this.initialSpawnTimer;

        this.gameContainer = $('.game__container');
        this.canvas = $('#game');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.font = '20px sans-serif';

        this.obstacles = [];

        this.score = 0;
        this.highScore = sessionStorage.getItem('highscore') ?? 0;

        this.inProgress = true;

    }


    start() {

        // Update Canvas Size
        this.canvas.width = this.gameContainer.offsetWidth;
        this.canvas.height = this.gameContainer.offsetHeight;

        // Create Player
        this.player = new Player(this.ctx, this.canvas, this.avatar, 40, this.gravity, this.jumpForce, this.maxJumpForce);

        // Create Scoreboards
        this.scoreboards = {
            main: new ScoreBoard(this.ctx, this.canvas, this.score, 'Score', 25, 25, 20),
            high: new ScoreBoard(this.ctx, this.canvas, this.highScore, 'High Score', this.canvas.width - 25, 25, 20, 'right')
        }

        // Begin Animating Canvas
        requestAnimationFrame(() => this.update());
    }


    update() {

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);


        // Update Obstacles
        this.updateObstacles();
        

        // Update Player Animation
        this.player.update();


        // Update Score
        this.updateScore();

        // Continuously Animate Canvas
        if (this.inProgress) requestAnimationFrame(() => this.update());

    }


    updateScore() {

        // Incrememnt Score
        this.score++;

        if (this.score > this.highScore) this.highScore = this.score;

        this.scoreboards.high.update(this.highScore);
        this.scoreboards.main.update(this.score);

    }


    updateObstacles() {

        // Decrement Spawn Timer
        this.spawnTimer--;


        if (this.spawnTimer <= 0) {

            this.spawnObstacle();
            this.spawnTimer = this.initialSpawnTimer - (this.gameSpeed * 8);

            if (this.spawnTimer < 60) this.spawnTimer = 60;

        }

        this.obstacles.forEach((o, i, ary) => {
            o.update();

            if (o.x + o.width < 0) ary.splice(i, 1);

            const p = this.player;

            if (
                p.x < o.x + o.width &&
                p.x + p.width > o.x &&
                p.y < o.y + o.height &&
                p.y + p.height > o.y
            ) {
                this.obstacles = [];
                // this.score = 0;
                // this.spawnTimer = this.initialSpawnTimer;
                // this.gameSpeed = this.initialGameSpeed;
                sessionStorage.setItem('highscore', this.highScore);
                this.end();
            }
        });

    }


    spawnObstacle() {

        const size = randomInt(20, 70);

        this.obstacles.push(
            new Obstacle(this.ctx, this.canvas, this.gameSpeed, this.canvas.width + size, this.canvas.height - size, size, size)
        );

    }


    end() {

        // Stop Animations
        this.inProgress = false;


        // Redraw Canvas To Prepare For Next Game
        this.canvas.parentElement.replaceChild(this.canvas.cloneNode(true), this.canvas);


        // Display Results
        const resultsContainer = $('#results');
        resultsContainer.innerHTML = '';
        resultsContainer.insertAdjacentHTML('afterbegin', `<h2>Score: ${this.score}</h2><h3>High Score: ${this.highScore}</h3>`);

        hide($('#game-screen'));
        show($('#end-screen'))

    }


}



// INITIALIZE EVENT LISTENERS
window.addEventListener('load', () => {

    const screens = {
        start: $('#start-screen'),
        avatar: $('#avatar-picker'),
        game: $('#game-screen'),
        end: $('#end-screen')
    }

    
    // Start The Game
    $('#start-screen button').addEventListener('click', () => {
        hide(screens.start);
        show(screens.avatar);
    });


    // Select Avatar
    $('.select-avatar').forEach(option => {

        option.addEventListener('click', event => {

            hide(screens.avatar);
            show(screens.game);
        

            game = new Game({ avatar: event.target.innerHTML });
            game.start();

        });

    });


    // Restart Game & Show Avatar Picker
    $('#end-screen button').addEventListener('click', () => {

        hide(screens.end);
        show(screens.avatar);

    });



    // Attach Keyboard Events to track state of pressed keys
    document.addEventListener('keydown', event => keys[event.code] = true);
    document.addEventListener('keyup', event => keys[event.code] = false);
    

});