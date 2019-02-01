import "phaser";
import { Resources } from './Resources';

class ScoreConstructor {
    x: number;
    y: number;
    scene: Phaser.Scene;
}

export class Score {
    private x: number;
    private y: number;
    private score: number;
    private scene: Phaser.Scene;
    private panel: Phaser.GameObjects.Image;
    private text: Phaser.GameObjects.Text;

    constructor(cObj: ScoreConstructor) {
        this.score = 0;
        this.x = cObj.x;
        this.y = cObj.y;
        this.scene = cObj.scene;

        this.panel = cObj.scene.add.image(cObj.x, cObj.y, Resources.scorePanel.name);

        let style = {
            font: "bold 40px Courier",
            fill: "#fff",
            boundsAlignH: "center",
            boundsAlignV: "middle",
            stroke: '#000000',
            strokeThickness: 2
        };
        this.text = cObj.scene.add.text(cObj.x - 160, cObj.y - 20, "SCORE: 000000", style);
    }

    inc = (value: number) => {
        this.score += value;
        this.text.setText("SCORE: " + ("000000" + this.score).slice(-6));
    }
}
