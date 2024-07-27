import {Ingredient} from "./ingredient.js";

export class Scene extends Phaser.Scene {
    ingredients = [
        new Ingredient("leaf", 0),
        new Ingredient("dust_gold", 0),
        new Ingredient("dust_purple", 0),
        new Ingredient("dust_blue", 0),
        new Ingredient("dust_green", 0),
        new Ingredient("dust_red", 0),
        new Ingredient("eye", 0),
        new Ingredient("poppy", 0),
    ]
    update_ingredient_labels() {
        this.ingredients.forEach(ingredient => {
            if (ingredient.label)
                ingredient.label.setText(ingredient.quantity)
        })
    }

    preload() {
        this.load.image("board", "assets/board.png")
        this.load.image("bowl", "assets/bowl.png")
        this.load.image("sigil", "assets/sigil.png")
        this.load.image("button1", "assets/button1.png")
        this.getIngredientNames().forEach((item, index) => {
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
        this.add.image(43, 43, "sigil").setOrigin(0, 0)
        this.createSpawnpoint(304 + 43, 155 + 43);
        this.createSpawnpoint(754 + 43, 162 + 43);
        this.createSpawnpoint(157 + 43, 586 + 43);
        this.createSpawnpoint(896 + 43, 581 + 43);
        this.createSpawnpoint(533 + 43, 836 + 43);

        const booster_button = this.add.image(
            1529,
            500,
            "button1"
        );
        booster_button
            .setInteractive()
        booster_button.on("pointerdown", () => {
            let index = Phaser.Math.Between(0, this.ingredients.length - 1)
            this.ingredients[index].quantity += 3;
            this.update_ingredient_labels()
        });

        this.ingredients.forEach((item, index) => {
            item.init_icon_and_label(index, this)
        })

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
            let ingredient_names = this.getIngredientNames();
            let index = Phaser.Math.Between(0, ingredient_names.length - 1)
            let ingredient_name = ingredient_names[index];
            if (this.ingredients[index].quantity > 0) {
                this.ingredients[index].quantity -= 1
            }
            this.update_ingredient_labels();
            const content_image = this.add.image(x_start, y_start, ingredient_name);
            content_image.setDisplaySize(100, 100)
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

}