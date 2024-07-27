class Scene extends Phaser.Scene {
    preload() {
        this.load.image("board", "assets/board.png")
        this.load.image("bowl", "assets/bowl.png")
        this.load.image("leaf", "assets/leaf.png")
        this.load.audio("hit", "assets/hit.wav")
        this.load.audio("swish", "assets/swish.wav")
        this.load.audio("hit2", "assets/hit2.wav")
    }

    create() {
        let hit_sound = this.sound.add('hit2');
        let swish_sound = this.sound.add('swish');

        this.add.image(0, 0, "board").setOrigin(0, 0)
        const spawnpoint = this.add.image(960, 540, "bowl");
        spawnpoint.setTint(0xff0000)
            .setDisplaySize(100, 100)
            .setInteractive()
        this.input.setDraggable(spawnpoint);
        const spawnpoint2 = this.add.image(60, 540, "bowl");
        spawnpoint2.setTint(0x00ff00)
            .setDisplaySize(100, 100)
            .setInteractive()
        this.input.setDraggable(spawnpoint2);

        let aim = this.add.graphics();
        aim.lineStyle(2, 0x00ff00);
        this.matter.world.setBounds(0, 0, 960, 1080);

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

        let self = this;
        this.input.on('dragend', function (pointer, gameObject) {
            let y_start = gameObject.y;
            let x_start = gameObject.x;
            let diff_x = gameObject.x - pointer.x;
            let diff_y = gameObject.y - pointer.y;
            let scale = 10;
            const bowl_image = self.add.image(x_start, y_start, "bowl");
            const leaf_image = self.add.image(x_start, y_start, "leaf");
            leaf_image.setDisplaySize(100, 100)
            bowl_image.setDisplaySize(100, 100)
            const block = self.matter.add.circle(
                x_start,
                y_start,
                50
            );
            const bowl = self.matter.add.gameObject(bowl_image, block);
            const leaf = self.matter.add.gameObject(leaf_image, block);
            bowl.setBounce(0.5);
            bowl.setVelocity(0, 0);
            bowl.setFriction(1, 0, 0);
            bowl.setAngularVelocity(0);
            bowl.setVelocity(diff_x / scale, diff_y / scale);
            aim.clear()
            hit_sound.detune = 0;
            swish_sound.play()
        });
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

