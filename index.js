// main.js

// Importera Phaser biblioteket (gör detta i din HTML-fil)
// <script src="https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"></script>

// Phaser-konfiguration
const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    backgroundColor: '#2d2d2d',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0 }, // Ingen gravitation så att fyrkanten kan röra sig fritt
            debug: true
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
function preload () {
}

// Create-funktionen, initialiserar spelet
function create () {
    // Skapa väggar runt skärmen
    this.matter.world.setBounds(0, 0, 1920, 1080);

    // Skapa en grafik och rita en fyrkant
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1); // Fyll fyrkanten med röd färg
    graphics.fillRect(0, 0, 50, 50); // Rita en fyrkant (50x50 pixlar)

    // Skapa en textur från grafiken
    graphics.generateTexture('block', 50, 50);
    graphics.destroy(); // Ta bort grafikobjektet eftersom vi inte längre behöver det

    // Skapa en fyrkant och sätt dess egenskaper
    const block = this.matter.add.image(960, 540, 'block');
    block.setBounce(1); // Gör så att fyrkanten studsar fullt ut
    block.setVelocity(10, 10); // Sätter initial hastighet för att starta rörelsen
    block.setFriction(0, 0, 0); // Ingen friktion
    block.setAngularVelocity(0.05); // Sätter en initial rotationshastighet

    // Justera storlek på blocket om nödvändigt (exempel: 50x50 pixlar)
    block.setDisplaySize(50, 50);
}

// Update-funktionen, spel-loopen
function update () {
    // Uppdatera spelets logik
}
