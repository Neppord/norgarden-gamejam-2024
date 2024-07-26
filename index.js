// main.js

// Importera Phaser biblioteket (gör detta i din HTML-fil)
// <script src="https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"></script>

// Phaser-konfiguration
const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    backgroundColor: '#2d2d2d',
    scale: {
        mode: Phaser.Scale.FIT, // Anpassa viewporten till fönstret
        autoCenter: Phaser.Scale.CENTER_BOTH // Centrera spelet både horisontellt och vertikalt
    },
    physics: {
        default: 'matter',
        matter: {
            gravity: {y: 0}, // Ingen gravitation så att fyrkanten kan röra sig fritt
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Skapa ett nytt Phaser-spel
const game = new Phaser.Game(config);

// Preload-funktionen, laddar resurser
function preload() {
    this.load.image("board", "assets/board.png")
    this.load.image("bowl", "assets/bowl.png")
}

// Create-funktionen, initialiserar spelet
function create() {
    // Skapa väggar runt skärmen
    this.add.image(0, 0, "board").setOrigin(0, 0)

    var aim = this.add.graphics();
    aim.lineStyle(2, 0x00ff00);
    this.matter.world.setBounds(0, 0, 960, 1080);

    function createBowl() {
        const block = this.matter.add.image(960, 540, 'bowl', null, {
            shape: {type: 'circle'}
        });
        block.setBounce(0.5); // Gör så att fyrkanten studsar fullt ut
        block.setVelocity(0, 0); // Sätter initial hastighet för att starta rörelsen
        block.setFriction(1, 0, 0); // Ingen friktion
        block.setAngularVelocity(0); // Sätter en initial rotationshastighet

        // Justera storlek på blocket om nödvändigt (exempel: 50x50 pixlar)
        block.setDisplaySize(100, 100);

        // Aktivera interaktivitet
        block.setInteractive();

        // Dra fyrkanten med musen
        this.input.setDraggable(block);
    }

    createBowl.call(this);

    // Lägg till dra-händelser
    this.input.on('dragstart', function (pointer, gameObject) {
        gameObject.setVelocity(0, 0);
        gameObject.setAngularVelocity(0);
    });

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        aim.clear()
        aim.lineBetween(gameObject.x, gameObject.y, pointer.x, pointer.y);
    });

    let self = this;
    this.input.on('dragend', function (pointer, gameObject) {
        let diff_x = gameObject.x - pointer.x;
        let diff_y = gameObject.y - pointer.y;
        let scale = 10;
        gameObject.setVelocity(diff_x / scale, diff_y / scale);
        self.input.setDraggable(gameObject, false);
        createBowl.call(self);
        aim.clear()
    });
}

// Update-funktionen, spel-loopen
function update() {
    // Uppdatera spelets logik
}
