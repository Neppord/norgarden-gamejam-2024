const SIZE = 50;

const SIZE_SELECTED = 90;

export class Ingredient {
    constructor(name, quantity) {
        this.name = name;
        this.quantity = quantity;
    }
    update_label() {
        if (this.label) this.label.setText(this.quantity)
    }
    init_icon_and_label(index, scene) {
        this.icon = scene.add
            .image(1280 + index * (SIZE + 20), SIZE, this.name)
            .setDisplaySize(SIZE, SIZE)
        this.icon.setInteractive()
        this.label = scene.add.text(
            1280 + index * (SIZE + 20),
            100,
            this.quantity,
            {font: '32px Arial', fill: '#ffffff'}
        );
    }
    deselect() {
        this.icon.setDisplaySize(SIZE, SIZE)
    }
    select() {
        this.icon.setDisplaySize(SIZE_SELECTED, SIZE_SELECTED)
    }
}