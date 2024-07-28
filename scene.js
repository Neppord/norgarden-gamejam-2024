import {Ingredient} from "./ingredient.js";

const RIGHT_FRAME_OFFSET = 1138;
const PADDING = 43;

export class Scene extends Phaser.Scene {
    ingredients = [
        new Ingredient("leaf", 0),
        new Ingredient("eye", 0),
        new Ingredient("poppy", 0),
    ]
    powders = [
        new Ingredient("dust_gold", 0),
        new Ingredient("dust_purple", 0),
        new Ingredient("dust_blue", 0),
        new Ingredient("dust_green", 0),
        new Ingredient("dust_red", 0),
    ]
    flasks = []
    selected_ingredient = null

    preload() {
        this.load.image("board", "assets/board.png")
        this.load.image("bowl", "assets/bowl.png")
        this.load.image("sigil", "assets/sigil.png")
        this.load.image("button1", "assets/button1.png")
        this.load.image("flask1", "assets/flask1.png")
        this.load.image("flask2", "assets/flask2.png")
        this.ingredients.map(i => i.name).forEach((item, index) => {
            this.load.image(item, "assets/" + item + ".png");
        })
        this.powders.map(i => i.name).forEach((item, index) => {
            this.load.image(item, "assets/" + item + ".png");
        })
        this.load.audio("hit", "assets/hit.wav")
        this.load.audio("swish", "assets/swish.wav")
        this.load.audio("hit2", "assets/hit2.wav")
    }

    create() {
        let hit_sound = this.sound.add('hit2');
        let swish_sound = this.sound.add('swish');

        this.add.image(0, 0, "board").setOrigin(0, 0)
        this.add.image(PADDING, PADDING, "sigil").setOrigin(0, 0)
        this.createSpawnpoint(304 + PADDING, 155 + PADDING);
        this.createSpawnpoint(754 + PADDING, 162 + PADDING);
        this.createSpawnpoint(157 + PADDING, 586 + PADDING);
        this.createSpawnpoint(896 + PADDING, 581 + PADDING);
        this.createSpawnpoint(533 + PADDING, 836 + PADDING);

        const booster_button = this.add.image(
            1529,
            500,
            "button1"
        );
        booster_button.setInteractive()
        let shake = this.tweens.add({
            targets: booster_button,
            angle: { from: -10, to: 10 },
            duration: 100,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            paused:true,
        })
        booster_button.on("pointerover", () =>{
            shake.play()
        })
        booster_button.on("pointerout", () =>{
            shake.pause()
            this.tweens.add({
                targets: booster_button,
                angle: 0,
                duration: 100,
                ease: 'Sine.easeInOut'
            })
        })

        booster_button.on("pointerdown", () => {
            let index = Phaser.Math.Between(0, this.ingredients.length - 1)
            let ingredient = this.ingredients[index];
            ingredient.quantity += 3;
            this.tweens.add({
                targets: ingredient.icon,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 100,
                ease: 'Power2',
                yoyo: true,
                repeat: 2,
            })
            ingredient.update_label()
        });

        this.ingredients.forEach((ingredient, index) => {
            ingredient.init_icon_and_label(index, this)
            ingredient.icon.on('pointerdown', () => {
                if (this.selected_ingredient)
                    this.selected_ingredient.deselect();
                this.selected_ingredient = ingredient
                ingredient.select()
            })

        })

        let aim = this.add.graphics();
        aim.lineStyle(2, 0x00ff00);
        this.matter.world.setBounds(0, 0, RIGHT_FRAME_OFFSET, 1080);

        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
            hit_sound.detune = Math.min(hit_sound.detune + 100, 2000);
            hit_sound.play();
            if (bodyA.ingredient_name === bodyB.ingredient_name) {
                let bowl = this.create_bowl(bodyA.position.x, bodyA.position.y, this.powders[0])
                bowl.setVelocity(bodyA.velocity.x, bodyB.velocity.y)
                bodyA.objects_to_destroy.forEach(o => o.destroy())
                bodyB.objects_to_destroy.forEach(o => o.destroy())


            }
        });

        this.input.on('dragstart', function (pointer, gameObject) {

        });

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            aim.clear()
            aim.lineBetween(gameObject.x, gameObject.y, pointer.x, pointer.y);
        });

        this.input.on('dragend', function (pointer, gameObject) {
            aim.clear()
            hit_sound.detune = 0;
            if (!(this.selected_ingredient && this.selected_ingredient.quantity > 0)) {
                return;
            }
            let y_start = gameObject.y;
            let x_start = gameObject.x;

            const bowl = this.create_bowl(x_start, y_start, this.selected_ingredient);
            this.selected_ingredient.quantity -= 1
            this.selected_ingredient.update_label()

            let scale = 10;
            let diff_x = x_start - pointer.x;
            let diff_y = y_start - pointer.y;
            bowl.setVelocity(diff_x / scale, diff_y / scale);
            swish_sound.play()

        }, this);
    }

    create_bowl(x_start, y_start, ingredient) {
        const bowl_image = this.add.image(x_start, y_start, "bowl");
        const content_image = this.add.image(x_start, y_start, ingredient.name);
        content_image.setDisplaySize(100, 100)
        bowl_image.setDisplaySize(100, 100)
        const block = this.matter.add.circle(
            x_start,
            y_start,
            50
        );
        block.ingredient_name = ingredient.name;
        const bowl = this.matter.add.gameObject(bowl_image, block);
        const content = this.matter.add.gameObject(content_image, block);
        block.objects_to_destroy = [
            bowl, content
        ]
        bowl.setBounce(0.5);
        bowl.setVelocity(0, 0);
        bowl.setFriction(0.05, 0.01, 0.1);
        bowl.setAngularVelocity(0);
        return bowl;
    }

    getIngredientNames() {
        return this.ingredients.map(i => i.name);
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

    position_flasks() {
        this.flasks.forEach((flask, index) => {
            flask.x = RIGHT_FRAME_OFFSET + PADDING + flask.width / 2 + index * 50
        })
    }
}