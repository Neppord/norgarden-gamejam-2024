import {Ingredient} from "./ingredient.js";

const RIGHT_FRAME_OFFSET = 1138;
const PADDING = 43;

export class Scene extends Phaser.Scene {
    ingredients = [
        new Ingredient("leaf", 0),
        new Ingredient("eye", 0),
        new Ingredient("poppy", 0),
        new Ingredient("heart", 0),
    ]
    powders = [
        new Ingredient("dust_gold", 0),
        new Ingredient("dust_purple", 0),
        new Ingredient("dust_blue", 0),
        new Ingredient("dust_green", 0),
        new Ingredient("dust_teal", 0),
    ]
    flasks = []
    selected_ingredient = null

    preload() {
        this.load.image("board", "assets/board.png")
        this.load.image("bowl", "assets/bowl.png")
        this.load.image("sigil", "assets/sigil_pentagram_w.png")
        this.load.image("sigil_orbit", "assets/sigil_orbit_w.png")
        this.load.image("sigil_rivets", "assets/sigil_rivets_w.png")
        this.load.image("sigil_sun", "assets/sigil_sun_w.png")
        this.load.image("sigil_triangle", "assets/sigil_triangle_w.png")
        this.load.image("sigil_xo", "assets/sigil_xo_w.png")
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
        this.sigil_corners = [
            this.createCorner("sigil_rivets", 304 + PADDING, 155 + PADDING),
            this.createCorner("sigil_orbit", 754 + PADDING, 162 + PADDING),
            this.createCorner("sigil_sun", 157 + PADDING, 586 + PADDING),
            this.createCorner("sigil_triangle", 896 + PADDING, 581 + PADDING),
            this.createCorner("sigil_xo", 533 + PADDING, 836 + PADDING),
        ]
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
            angle: {from: -10, to: 10},
            duration: 100,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            paused: true,
        })
        booster_button.on("pointerover", () => {
            shake.play()
        })
        booster_button.on("pointerout", () => {
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
            if (bodyA.onCollision) {
                bodyA.onCollision(bodyB);
            } else if (bodyB.onCollision) {
                bodyB.onCollision(bodyA);
            } else if (bodyA.onCollision) {
                bodyA.onCollision(bodyB);
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

    createCorner(key, x, y) {
        let image = this.add.image(0, 0, key);
        let circle = this.matter.add.circle(0, 0, 140);
        let corner = this.matter.add.gameObject(
            image,
            circle
        );
        image.setPosition(x, y).setDisplayOrigin(x - PADDING, y - PADDING);
        circle.onCollision = (item) => {
            if(item.ingredient_name === "dust_gold"){
                image.setTint("0x0000ff")
            }else if (item.ingredient_name === "dust_blue"){
                image.setTint("0x00ff00")
            }else if (item.ingredient_name === "dust_purple"){
                image.setTint("0xff0000")
            }
        }
        image.setInteractive()
        return corner.setSensor(true)
    }

    createPowder(xStart, yStart, powder, velocityX, velocityY) {
        let bowl = this.create_bowl(xStart, yStart, powder)
        bowl.setVelocity(velocityX, velocityY)
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
        block.onCollision = (other) => {
            let xStart = (block.position.x + other.position.x) / 2;
            let yStart = (block.position.y + other.position.y) / 2;
            let velocityX = block.velocity.x + other.velocity.x;
            let velocityY = block.velocity.y + other.velocity.y;

            let a_name = block.ingredient_name;
            let b_name = other.ingredient_name;
            if (a_name === "leaf" && b_name === "leaf") {
                this.createPowder(xStart, yStart, this.powders[0], velocityX, velocityY);
                block.objects_to_destroy.forEach(o => o.destroy())
                other.objects_to_destroy.forEach(o => o.destroy())
            } else if (a_name === "leaf" && b_name === "poppy") {
                this.createPowder(xStart, yStart, this.powders[1], velocityX, velocityY);
                block.objects_to_destroy.forEach(o => o.destroy())
                other.objects_to_destroy.forEach(o => o.destroy())
            } else if (a_name === "poppy" && b_name === "leaf") {
                this.createPowder(xStart, yStart, this.powders[1], velocityX, velocityY);
                block.objects_to_destroy.forEach(o => o.destroy())
                other.objects_to_destroy.forEach(o => o.destroy())
            } else if (a_name === "poppy" && b_name === "poppy") {
                this.createPowder(xStart, yStart, this.powders[2], velocityX, velocityY);
                block.objects_to_destroy.forEach(o => o.destroy())
                other.objects_to_destroy.forEach(o => o.destroy())
            }
        }
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