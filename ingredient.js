export class Ingredient {
    constructor(name, quantity) {
        this.name = name;
        this.quantity = quantity;
    }

    init_icon_and_label(index, scene) {
        let size = 50;
        this.icon = scene.add
            .image(1280 + index * (size + 20), 50, this.name)
            .setDisplaySize(size, size)
        this.label = scene.add.text(
            1280 + index * (size + 20),
            100,
            this.quantity,
            {font: '32px Arial', fill: '#ffffff'}
        );
    }
}