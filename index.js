class Scene extends Phaser.Scene {
    preload() {
        this.load.image("board", "assets/board.png")
        this.load.image("bowl", "assets/bowl.png")
        this.load.audio("hit", "assets/hit.wav")
        this.load.audio("hit2", "assets/hit2.wav")
    }

    create() {
        var hit_sound = this.sound.add('hit2');
        hit_sound.play();

        this.add.image(0, 0, "board").setOrigin(0, 0)

        var aim = this.add.graphics();
        aim.lineStyle(2, 0x00ff00);
        this.matter.world.setBounds(0, 0, 960, 1080);

        function createBowl() {
            const block = this.matter.add.image(960, 540, 'bowl', null, {
                shape: {type: 'circle'}
            });
            block.setBounce(0.5);
            block.setVelocity(0, 0);
            block.setFriction(1, 0, 0);
            block.setAngularVelocity(0);

            block.setDisplaySize(100, 100);

            block.setInteractive();
            this.input.setDraggable(block);
        }

        this.matter.world.on('collisionstart', function (event) {
            hit_sound.detune = Math.min(hit_sound.detune + 100, 2000);
            hit_sound.play();
        });
        createBowl.call(this);

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
            hit_sound.detune = 0;
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
            debug: false
        }
    },
    scene: Scene
};

const game = new Phaser.Game(config);

