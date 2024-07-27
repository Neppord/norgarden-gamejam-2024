class Scene extends Phaser.Scene {
    preload() {
        this.load.image("board", "assets/board.png")
        this.load.image("bowl", "assets/bowl.png")
        this.load.image("sigil", "assets/sigil.png")
        this.load.image("leaf", "assets/leaf.png")
        this.load.image("dust_gold", "assets/dust_gold.png")
        this.load.audio("hit", "assets/hit.wav")
        this.load.audio("swish", "assets/swish.wav")
        this.load.audio("hit2", "assets/hit2.wav")
    }

    create() {
        let hit_sound = this.sound.add('hit2');
        let swish_sound = this.sound.add('swish');

        this.add.image(0, 0, "board").setOrigin(0, 0)
        this.add.image(43,43, "sigil").setOrigin(0, 0)
        this.createSpawnpoint(304+43, 155+43);
        this.createSpawnpoint(754+43, 162+43);
        this.createSpawnpoint(157+43, 586+43);
        this.createSpawnpoint(896+43, 581+43);
        this.createSpawnpoint(533+43, 836+43);

        let aim = this.add.graphics();
        aim.lineStyle(2, 0x00ff00);
        this.matter.world.setBounds(0, 0, 1138, 1080);

        this.matter.world.on('collisionstart', function (event) {
            hit_sound.detune = Math.min(hit_sound.detune + 100, 2000);
            hit_sound.play();
        });

        this.input.on('dragstart', function (pointer, gameObject) {

        });

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            aim.clear()
            aim.lineBetween(gameObject.x, gameObject.y, pointer.x, pointer.y);
        });

        this.input.on('dragend', function (pointer, gameObject) {
            let y_start = gameObject.y;
            let x_start = gameObject.x;
            let diff_x = gameObject.x - pointer.x;
            let diff_y = gameObject.y - pointer.y;
            let scale = 10;
            const bowl_image = this.add.image(x_start, y_start, "bowl");
            let contents = ["leaf", "dust_gold"]
            let index = Phaser.Math.Between(0, contents.length - 1)
            const content_image = this.add.image(x_start, y_start, contents[index]);
            content_image.setDisplaySize(60, 60)
            bowl_image.setDisplaySize(100, 100)
            const block = this.matter.add.circle(
                x_start,
                y_start,
                50
            );
            const bowl = this.matter.add.gameObject(bowl_image, block);
            const content = this.matter.add.gameObject(content_image, block);
            bowl.setBounce(0.5);
            bowl.setVelocity(0, 0);
            bowl.setFriction(0.05, 0.01, 0.1);
            bowl.setAngularVelocity(0);
            bowl.setVelocity(diff_x / scale, diff_y / scale);
            aim.clear()
            hit_sound.detune = 0;
            swish_sound.play()
        }, this);
    }

    createSpawnpoint(x, y) {
        const spawnpoint = this.add.image(x, y, "bowl");
        spawnpoint.setAlpha(0.6)
            .setDisplaySize(100, 100)
            .setInteractive()
        this.input.setDraggable(spawnpoint);
    }

    update() {
    }

}

const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    backgroundColor: '#2d2d2d',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'matter',
        matter: {
            gravity: {y: 0},
            debug: true

        }
    },
    scene: Scene
};

const game = new Phaser.Game(config);

