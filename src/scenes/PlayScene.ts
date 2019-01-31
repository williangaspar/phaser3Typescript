import { Resources } from "../components/Resources";
import { GemGrid } from "../components/GemGrid";
import { Score } from "../components/Score";
import { Gem } from "../components/Gem";
import { Events } from "../components/Events";

class GameScene extends Phaser.Scene {
	background: Phaser.GameObjects.Image;
	score: Score;
	grid: GemGrid;
	gem: Gem;
	lifes: number;

	constructor() {
		super({
			key: 'GameScene'
		});
	}

	preload() {
		Resources.load(this, Resources.background);
		Resources.load(this, Resources.diamondBlue);
		Resources.load(this, Resources.diamondRed);
		Resources.load(this, Resources.diamondGreen);
		Resources.load(this, Resources.diamondYellow);
		Resources.load(this, Resources.badrock);
		Resources.load(this, Resources.scorePanel);
	}

	create() {
		this.lifes = 1;

		this.background = this.add.image(215, 215, Resources.background.name);
		this.score = new Score({ scene: this, x: 215, y: 485 });
		this.grid = new GemGrid({ x: 40, y: 40, scene: this });

		this.check();

		this.input.mouse.capture = true;

		this.sys.events.on(Events.gemClick, (gem: Gem) => {
			this.gem = gem;
		});
	}

	check = () => {
		this.input.mouse.enabled = false;
		let match = this.grid.check();
		if (match.length) {
			let match = this.grid.check();
			this.grid.remove(match).then(() => {
				match.forEach((e, idx) => this.score.inc(e.list.length * e.list.length + (match.length - idx)));
				this.grid.repopulate();
			});
			setTimeout(this.check, 2000);
		} else {
			this.checkGameover();
		}
	}

	checkGameover = () => {
		if (this.grid.isGameOver()) {
			if (this.lifes) {
				this.input.mouse.enabled = true;
				this.lifes--;
				this.grid.replaceBadrock();
				this.check();
			} else {
			this.grid.disableGems();
				let style = {
					font: "bold 50px Courier",
					fill: "#fff",
					boundsAlignH: "center",
					boundsAlignV: "middle",
					stroke: '#000000',
					strokeThickness: 4
				};
				let text = this.add.text(this.background.width / 2, this.background.height / 2, "GAME OVER!", style);
				text.setOrigin(0.5, 0.5)
			}
		} else {
			this.input.mouse.enabled = true;
		}

	}

	update(time: number, delta: number) {
		if (!this.input.mouse.enabled) {
			return;
		}

		let pointer = this.input.activePointer;
		if (this.gem) {
			this.gem.sprite.x = pointer.position.x;
			this.gem.sprite.y = pointer.position.y;

			let overlapItem = this.grid.overLappingWith(this.gem, pointer.position);
			if (overlapItem) {
				this.input.mouse.enabled = false;

				this.grid.swapPosition(this.gem, overlapItem).then(() => {
					let checkList = this.grid.check();

					if (checkList.length) {
						this.check();
					} else {
						this.grid.swapPosition(this.gem, overlapItem).then(() => this.input.mouse.enabled = true);
					};

					this.gem = null;
				});

			}
		}

		if (this.gem && !pointer.isDown) {
			this.gem.backToGridPosition();
			this.gem = null;
		}
	}
}

export default GameScene;
