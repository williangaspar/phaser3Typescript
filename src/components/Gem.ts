import 'phaser';
import { Resources } from "./Resources";
import { Events } from "./Events";

const GEM_LIST = [
    Resources.diamondBlue,
    Resources.diamondRed,
    Resources.diamondGreen,
    Resources.diamondYellow,
    Resources.badrock,
]

class GemConstructor {
    x: number;
    y: number;
    column: number;
    row: number;
    visible: boolean;
    scene: Phaser.Scene;
}

class MoveTo {
    x: number;
    y: number;
    column: number;
    row: number;
}

export class Gem {
    readonly type: string;
    readonly scene: Phaser.Scene;
    readonly sprite: Phaser.GameObjects.Image;
    private _x: number;
    private _y: number;
    private _column: number;
    private _row: number;
    private disabled: boolean = false;

    static GENERATE_BADROCK: boolean = false;

    tween: Phaser.Tweens.Tween;

    constructor(cObj: GemConstructor) {
        let type = 0;
        if (Gem.GENERATE_BADROCK) {
            type = Phaser.Math.Between(0, 4);
            if (GEM_LIST[type].name == Resources.badrock.name) {
                type = Phaser.Math.Between(0, 4);
            }
        } else {
            type = Phaser.Math.Between(0, 3);
        }

        this.type = GEM_LIST[type].name

        this.sprite = cObj.scene.add.image(cObj.x, cObj.y, this.type);
        this.sprite.visible = cObj.visible;
        this.sprite.name

        this.sprite.setInteractive();

        if (this.type != Resources.badrock.name) {
            this.sprite.on("pointerdown", () => {
                if (!this.disabled) {
                    this.scene.children.bringToTop(this.sprite);
                    this.scene.sys.events.emit(Events.gemClick, this);
                }

            });
        }

        this._column = cObj.column;
        this._row = cObj.row;
        this.scene = cObj.scene;
        this._x = cObj.x;
        this._y = cObj.y;
    }

    get column() {
        return this._column;
    }

    get row() {
        return this._row;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    moveTo = (obj: MoveTo, moveSprite: boolean = true) => {
        this._x = obj.x;
        this._y = obj.y;
        this._row = obj.row;
        this._column = obj.column;

        if (moveSprite) {
            this.backToGridPosition();
        };
    }

    fallTo = (y: number, row: number) => {
        this._row = row;
        this._y = y;
        this.tween = this.scene.add.tween({
            targets: [this.sprite],
            ease: 'Sine.Quadratic.Out',
            duration: 200 + y - this.sprite.y,
            delay: 0,
            y: {
                getStart: () => this.sprite.y,
                getEnd: () => y,
            },
        });
    }

    backToGridPosition = () => {
        this.tween = this.scene.add.tween({
            targets: [this.sprite],
            ease: 'Sine.easeInOut',
            duration: 100 + (Math.abs(this.sprite.y - this._y) + Math.abs(this.sprite.x - this._y)) / 2,
            delay: 0,
            y: {
                getStart: () => this.sprite.y,
                getEnd: () => this._y,
            },

            x: {
                getStart: () => this.sprite.x,
                getEnd: () => this._x,
            },
        });
    }

    disableClick = () => {
        /*
            The only line really working here is the last one
            idk why, by on mobile especially, the first 2 has no effect
        */
        this.sprite.setInteractive(false);
        this.sprite.on("pointerdown", () => { });
        this.disabled = true;
    }

    destroy = () => {
        this.tween = this.scene.add.tween({
            targets: [this.sprite],
            ease: 'Sine.easeInOut',
            duration: 500,
            delay: 0,
            alpha: {
                getStart: () => this.sprite.alpha,
                getEnd: () => 0,
            },
            scaleX: {
                getStart: () => this.sprite.scaleX,
                getEnd: () => 0.1,
            },
            scaleY: {
                getStart: () => this.sprite.scaleY,
                getEnd: () => 0.1,
            },
            onComplete: () => {
                this.sprite.destroy();
            }
        });
    }
}
