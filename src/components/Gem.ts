import "phaser";
import { Events } from "./Events";
import { Grid, Coordenate } from './Grid';
import { GemType } from './GemType';

export class GemFactoryonstructor {
    x: number;
    y: number;
    cell: Coordenate;
    visible: boolean;
    scene: Phaser.Scene;
    grid: Grid<Gem>;
}

export class GemConstructor extends GemFactoryonstructor {
    typeName: string;
    type: GemType;
}

class MoveTo {
    x: number;
    y: number;
    cell: Coordenate;
}

export class Gem {
    readonly type: GemType;
    readonly scene: Phaser.Scene;
    readonly sprite: Phaser.GameObjects.Image;

    private _x: number;
    private _y: number;
    private _cell: Coordenate;

    protected disabled: boolean = false;
    protected grid: Grid<Gem>;
    protected _stackable: boolean;

    tween: Phaser.Tweens.Tween;

    constructor(cObj: GemConstructor) {
        this.type = cObj.type;
        this.grid = cObj.grid;

        this.sprite = cObj.scene.add.image(cObj.x, cObj.y, cObj.typeName);
        this.sprite.visible = cObj.visible;

        this._cell = cObj.cell;
        this.scene = cObj.scene;
        this._x = cObj.x;
        this._y = cObj.y

        this.setup();
    }

    protected setup() {
        this._stackable = true;
        this.sprite.setInteractive();
        this.sprite.on("pointerdown", () => {
            if (!this.disabled) {
                this.scene.children.bringToTop(this.sprite);
                this.scene.sys.events.emit(Events.gemClick, this);
            }

        });
    }

    get cell() {
        return this._cell;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get stackable() {
        return this._stackable;
    }

    moveTo = (obj: MoveTo, moveSprite: boolean = true) => {
        this._x = obj.x;
        this._y = obj.y;
        this._cell = obj.cell

        if (moveSprite) {
            this.backToGridPosition();
        };
    }

    fallTo = (y: number, row: number) => {
        this._cell.row = row;
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
            idk why, but on mobile the first 2 lines have no effect
        */
        this.sprite.setInteractive(false);
        this.sprite.on("pointerdown", () => { });
        this.disabled = true;
    }

    destroy = () => {
        this.onDestroy();
    }

    calcPossibleMoves = (): Coordenate[] => {
        let maxBoudaryColumns = this.grid.columns.length;
        let maxBoudaryRows = this.grid.rows.length;
        let moves: Coordenate[] = [];

        if (this.cell.column - 1 > -1) { //move to the left
            moves.push({ column: this.cell.column - 1, row: this.cell.row });
        };

        if (this.cell.column + 1 < maxBoudaryColumns) { //move to the right
            moves.push({ column: this.cell.column + 1, row: this.cell.row });
        };

        if (this.cell.row - 1 > -1) { //move to the top
            moves.push({ column: this.cell.column, row: this.cell.row - 1 });
        };

        if (this.cell.row + 1 < maxBoudaryRows) { //move to the bottom
            moves.push({ column: this.cell.column, row: this.cell.row + 1 });
        };

        return moves;
    }

    protected onDestroy() {
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
