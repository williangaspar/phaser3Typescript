import { Gem, GemConstructor } from "./Gem";
import { Events } from "./Events";

export class Bomb extends Gem {
    constructor(cObj: GemConstructor) {
        super(cObj);
    }

    protected setup() {
        this.sprite.setInteractive();
        this._stackable = false;
        this.sprite.on("pointerdown", () => {
            if (!this.disabled) {
                this.onDestroy();
                this.explode();
                setTimeout(() => {
                    this.scene.sys.events.emit(Events.updateScene);
                }, 500);

            }

        });
    }

    protected onDestroy() {
        this.grid.setCell(this.cell, null);
        this.tween = this.scene.add.tween({
            targets: [this.sprite],
            ease: 'Easing.Bounce.InOut',
            duration: 300,
            delay: 0,
            alpha: {
                getStart: () => this.sprite.alpha,
                getEnd: () => 0,
            },
            scaleX: {
                getStart: () => this.sprite.scaleX,
                getEnd: () => 1.3,
            },
            scaleY: {
                getStart: () => this.sprite.scaleY,
                getEnd: () => 1.3,
            },
            onComplete: () => {
                this.sprite.destroy();
            }
        });
    }

    private explode = () => {
        let possibleMoves = this.calcPossibleMoves();

        possibleMoves.forEach((m) => {
            let gem = this.grid.cell({ column: m.column, row: m.row });
            gem.destroy();
            this.grid.setCell(gem.cell, null);
        });
    }

}
