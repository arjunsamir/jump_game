// HELPER FUNCTIONS
const $ = selector => {

    let elements = document.querySelectorAll(selector);

    if (elements.length === 1) elements = elements[0];

    return elements;

}






// DECLARE GLOBAL VARIABLES
let player, score, highScore, gravity, gameSpeed, gameContainer, obstacles = [], keys = {};





// CLASS DECLARATIONS
class Avatar {

    constructor(emoji) {

        this.emoji = emoji;
        this.element = $('#avatar');

        this.y = 150;

        this.dy = 0;
        this.jumpForce = 15;
        this.jumpTimer = 0;

        this.grounded = true;
    }

    render() {
        this.element.innerHTML = this.emoji;
        this.height = this.element.offsetHeight;
    }

    jump() {

    }

    update() {

        // Apply Y directional FOrce
        this.y += this.dy;

        if (this.y + this.height < gameContainer.offsetHeight) {
            this.dy += gravity;
            this.grounded = false;
        }

        else {
            this.dy = 0;
            this.dy += gravity;
            this.y = gameContainer.offsetHeight - this.height;
        }

        

        // // Apply Gravity
        // if (this.y + this.height < canvas.height) {
        //     this.dy += gravity;
        //     this.grounded = false;
        // }

        // else {
        //     this.dy = 0;
        //     this.grounded = true;
        //     this.y = canvas.height - this.height;
        // }

        this.element.style.transform = `translateY(${this.y}px)`;

    }

}



// GAME FUNCTIONS

// 1. Function To Open Menus and Select Avatar
const openMenu = () => {

    // Define Elements
    const startScreen = $('#start-screen');
    const startButton = $('#start-screen button');
    const avatarScreen = $('#avatar-picker');
    const avatarOptions =$('.select-avatar');




    // Start The Game
    startButton.addEventListener('click', () => {

        startScreen.style.display = 'none';

    });


    // Select Avatar
    avatarOptions.forEach(option => {

        option.addEventListener('click', event => {

            player = new Avatar(event.target.innerHTML);
            avatarScreen.style.display = 'none';
            startGame();

        });

    });

}


// 2. Start the Game
const startGame = () => {

    // 1. Rendering Player
    player.render();


    // 2. Update Game Container Variable
    gameContainer = $('.game-container');


    // 3. Start Animation
    requestAnimationFrame(updateGame);

}


// 3. Update The Game
const updateGame = () => {

    // Animate Current Player
    player.update();


    // Repeatedly Call Function
    requestAnimationFrame(updateGame);

}



// 4. Attach Keyboard Evevnts
const attachKeyboardEvents = () => {

    document.addEventListener('keydown', event => {
        keys[event.code] = true;
    });

    document.addEventListener('keyup', event => {
        keys[event.code] = false;
    });

}





// INITIALIZE THINGS HERE

// 1. Load Game
openMenu();


// 2. Attach Events
attachKeyboardEvents();