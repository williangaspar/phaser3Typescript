webpackJsonp([0],{

/***/ 1079:
/*!*********************************!*\
  !*** ./src/scenes/PlayScene.ts ***!
  \*********************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

const Resources_1 = __webpack_require__(/*! ../components/Resources */ 211);

const GemGrid_1 = __webpack_require__(/*! ../components/GemGrid */ 1080);

const Score_1 = __webpack_require__(/*! ../components/Score */ 1085);

const Events_1 = __webpack_require__(/*! ../components/Events */ 436);

const GemType_1 = __webpack_require__(/*! ../components/GemType */ 1087);

class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameScene'
    });

    this.check = (chain = 0) => {
      this.input.mouse.enabled = false;
      let match = this.grid.check();

      if (match.length) {
        let match = this.grid.check();
        this.grid.remove(match).then(() => {
          match.forEach((e, idx) => this.score.inc(Math.pow(e.list.length, 2) + (match.length - idx) + Math.pow(chain, 2)));
          this.grid.repopulate();
        });
        setTimeout(() => this.check(chain + 1), 2000);
      } else {
        this.checkGameover();
      }
    };

    this.checkGameover = () => {
      if (this.grid.isGameOver()) {
        if (this.lifes) {
          this.input.mouse.enabled = true;
          this.lifes--;
          this.grid.replaceBadrock().then(this.check);
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
          text.setOrigin(0.5, 0.5);
        }
      } else {
        this.input.mouse.enabled = true;
      }
    };
  }

  preload() {
    Resources_1.Resources.load(this, Resources_1.Resources.background);
    Resources_1.Resources.load(this, Resources_1.Resources.scorePanel);
    GemType_1.GEM_LIST.forEach(e => Resources_1.Resources.load(this, e.res));
  }

  create() {
    this.lifes = 1;
    this.background = this.add.image(215, 215, Resources_1.Resources.background.name);
    this.score = new Score_1.Score({
      scene: this,
      x: 215,
      y: 485
    });
    this.grid = new GemGrid_1.GemGrid({
      x: 40,
      y: 40,
      scene: this
    });
    this.check();
    this.input.mouse.capture = true;
    this.sys.events.on(Events_1.Events.gemClick, gem => {
      this.gem = gem;
    });
  }

  update(time, delta) {
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
          }

          ;
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

exports.default = GameScene;

/***/ }),

/***/ 1080:
/*!***********************************!*\
  !*** ./src/components/GemGrid.ts ***!
  \***********************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(/*! phaser */ 54);

const MatchSequenceHelper_1 = __webpack_require__(/*! ./MatchSequenceHelper */ 1081);

const GemFactory_1 = __webpack_require__(/*! ./GemFactory */ 1082);

const Grid_1 = __webpack_require__(/*! ./Grid */ 1084);

const GemType_1 = __webpack_require__(/*! ./GemType */ 1087);

const SPACING = 70;

class GemGridConstructor {}

class GemGrid {
  constructor(cObj) {
    this.check = () => {
      let matchListGrid = [];
      this.searchSequenceOnGrid(this.grid.rows, matchListGrid);
      this.searchSequenceOnGrid(this.grid.columns, matchListGrid);
      return matchListGrid;
    };

    this.remove = matchList => {
      matchList.forEach(matchItem => {
        let gemList = matchItem.list;
        gemList.forEach(gem => {
          let coordenate = {
            column: gem.column,
            row: gem.row
          };

          if (this.grid.cell(coordenate) != null) {
            gem.destroy();
          }

          ;
          this.grid.setCell(coordenate, null);
        });
      });
      return new Promise(resolve => {
        setTimeout(() => {
          this.fall();
          resolve();
        }, 500);
      });
    };

    this.repopulate = (excludeList = []) => {
      this.grid.columns.forEach((column, cIdx) => {
        column.forEach((item, lIdx) => {
          if (!item) {
            let xBegin = cIdx * SPACING + this.x;
            let yBegin = -((column.length - lIdx) * SPACING);
            let newItem = GemFactory_1.GemFactory.getGem({
              column: cIdx,
              row: lIdx,
              scene: this.scene,
              visible: true,
              x: xBegin,
              y: yBegin,
              grid: this.grid
            }, excludeList);
            let yFinal = lIdx * SPACING + this.y;
            this.grid.setCell({
              column: cIdx,
              row: lIdx
            }, newItem);
            newItem.fallTo(yFinal, newItem.row);
          }

          ;
        });
      });
    };

    this.overLappingWith = (gem, position) => {
      let possibleMoves = gem.calcPossibleMoves();

      for (let i = 0; i < possibleMoves.length; i++) {
        let m = possibleMoves[i];
        let overlapItem = this.grid.cell({
          column: m.column,
          row: possibleMoves[i].row
        });

        if (overlapItem && overlapItem.type != GemType_1.GemType.badrock) {
          let width = overlapItem.sprite.width / 2 - 10;
          let height = overlapItem.sprite.height / 2 - 10;
          let xBoundary = [overlapItem.x - width, overlapItem.x + width];
          let yBoundary = [overlapItem.y - height, overlapItem.y + height];
          let xOverlapping = position.x > xBoundary[0] && position.x < xBoundary[1];
          let yOverlapping = position.y > yBoundary[0] && position.y < yBoundary[1];
          let isOverlapping = xOverlapping && yOverlapping;

          if (isOverlapping) {
            return overlapItem;
          }

          ;
        }

        ;
      }

      ;
    };

    this.swapPosition = (gem1, gem2, doMoveSprite = true) => {
      let x1 = gem1.x;
      let y1 = gem1.y;
      let column1 = gem1.column;
      let row1 = gem1.row;
      let m1 = {
        column: column1,
        row: row1
      };
      let x2 = gem2.x;
      let y2 = gem2.y;
      let column2 = gem2.column;
      let row2 = gem2.row;
      let m2 = {
        column: column2,
        row: row2
      };
      this.grid.setCell(m2, gem1);
      this.grid.setCell(m1, gem2);
      gem1.moveTo({
        x: x2,
        y: y2,
        row: row2,
        column: column2
      }, doMoveSprite);
      gem2.moveTo({
        x: x1,
        y: y1,
        row: row1,
        column: column1
      }, doMoveSprite);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    };

    this.isGameOver = () => {
      /*
          This is not a very optimized solution since we will have a lot of
          overlapping check, but it will still been fast sice we don't have
          that many columns and rows
       */
      for (let c = 0; c < this.grid.columns.length; c++) {
        let column = this.grid.columns[c];

        for (let r = 0; r < column.length; r++) {
          let gem = this.grid.cell({
            column: c,
            row: r
          });
          let possibleMoves = gem.calcPossibleMoves(); // check if any move will result in a match

          for (let i = 0; i < possibleMoves.length; i++) {
            let m = possibleMoves[i];
            let swapGem = this.grid.cell({
              column: m.column,
              row: possibleMoves[i].row
            });

            if (!(gem.type == GemType_1.GemType.badrock || swapGem.type == GemType_1.GemType.badrock)) {
              let matchListGrid = [];
              this.swapPosition(gem, swapGem, false);
              this.searchSequenceOnGrid([this.grid.row(gem.row)], matchListGrid);
              this.searchSequenceOnGrid([this.grid.column(gem.column)], matchListGrid);

              if (matchListGrid.length) {
                // if yes, just go on.
                this.swapPosition(gem, swapGem);
                return false;
              }

              this.swapPosition(gem, swapGem);
            }
          }
        }
      } // if no move will result in a match, the game is over!


      return true;
    };

    this.replaceBadrock = () => {
      return new Promise(resolve => {
        this.grid.columns.forEach((column, cIdx) => {
          column.forEach((item, lIdx) => {
            if (item.type == GemType_1.GemType.badrock) {
              item.destroy();
              this.grid.setCell({
                column: cIdx,
                row: lIdx
              }, null);
              setTimeout(() => {
                this.fall();
                this.repopulate([GemType_1.GemType.badrock]);
              }, 500);
            }

            ;
          });
        });
        setTimeout(() => {
          resolve();
        }, 1500);
      });
    };

    this.disableGems = () => {
      this.grid.columns.forEach(column => {
        column.forEach(item => {
          item.disableClick();
        });
      });
    };

    this.searchSequenceOnGrid = (grid, matchListGrid) => {
      grid.forEach(e => {
        let matchList = this.searchSequenceOnList(e, 0, []);

        if (matchList.length) {
          matchListGrid.push(...matchList);
        }

        ;
      });
    };

    this.searchSequenceOnList = (list, index, matchList) => {
      let item = list[index];
      let matchItem = matchList.filter(e => e.type == item.type);

      if (matchItem.length) {
        matchItem[0].add(item);
      } else if (item.type != GemType_1.GemType.badrock) {
        let newMatchItem = new MatchSequenceHelper_1.MatchSequenceHelper(item);
        matchList.push(newMatchItem);
      }

      ;

      if (index < list.length - 1) {
        index++;
        return this.searchSequenceOnList(list, index, matchList);
      } else {
        matchList = matchList.filter(e => {
          e.end();
          return e.size();
        });
        return matchList;
      }

      ;
    };

    this.fall = () => {
      this.grid.sort((a, b) => {
        let aValue = a ? 1 : -1;
        let bValue = b ? 1 : -1;
        return aValue - bValue;
      });
      this.grid.columns.forEach(column => {
        column.forEach((item, index) => {
          if (item) {
            item.fallTo(index * SPACING + this.y, index);
          }
        });
      });
    };

    this.grid = new Grid_1.Grid({
      column: 6,
      row: 6
    });
    this.grid.populate(coordenate => {
      let x = coordenate.column * SPACING + cObj.x;
      let y = coordenate.row * SPACING + cObj.y;
      let column = coordenate.column;
      let row = coordenate.row;
      let grid = this.grid;
      let item = GemFactory_1.GemFactory.getGem({
        column,
        row,
        scene: cObj.scene,
        visible: true,
        x,
        y,
        grid
      }, [GemType_1.GemType.badrock]);
      return item;
    });
    this.x = cObj.x;
    this.y = cObj.y;
    this.scene = cObj.scene;
  }

}

exports.GemGrid = GemGrid;

/***/ }),

/***/ 1081:
/*!***********************************************!*\
  !*** ./src/components/MatchSequenceHelper.ts ***!
  \***********************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

class MatchSequenceHelper {
  constructor(gem) {
    this.add = gem => {
      let lastElement = this.currentList[this.currentList.length - 1];

      if (gem.row > lastElement.row + 1 || gem.column > lastElement.column + 1) {
        // ideintify a gap. Like: B B Y B
        this.end();
      }

      this.currentList.push(gem);
    };

    this.type = gem.type;
    this.currentList = [gem];
    this.matchList = [];
  }

  size() {
    return this.matchList.length;
  }

  get list() {
    return this.matchList;
  }

  end() {
    if (this.currentList.length > 2) {
      this.matchList.push(...this.currentList.slice());
    }

    this.currentList = [];
  }

}

exports.MatchSequenceHelper = MatchSequenceHelper;

/***/ }),

/***/ 1082:
/*!**************************************!*\
  !*** ./src/components/GemFactory.ts ***!
  \**************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(/*! phaser */ 54);

const Gem_1 = __webpack_require__(/*! ./Gem */ 212);

const Badrock_1 = __webpack_require__(/*! ./Badrock */ 1083);

const GemType_1 = __webpack_require__(/*! ./GemType */ 1087);

class GemFactory {}

GemFactory.getGem = (gemConstructor, exclude = []) => {
  let gemList = GemType_1.GEM_LIST.filter(g => !exclude.some(e => e == g.type));
  let item = GemFactory.getType(gemList);

  if (item.type == GemType_1.GemType.badrock) {
    return new Badrock_1.Badrock(Object.assign({}, gemConstructor, {
      typeName: item.res.name,
      type: item.type
    }));
  } else {
    return new Gem_1.Gem(Object.assign({}, gemConstructor, {
      typeName: item.res.name,
      type: item.type
    }));
  }
};

GemFactory.getType = (gemList, lastType = null, iterations = 0) => {
  let type = Phaser.Math.Between(0, gemList.length - 1);
  let item = gemList[type];

  if (item.rare == 0 || item.rare <= iterations) {
    return item;
  } else {
    iterations = lastType == item.type || lastType == null ? iterations + 1 : 0;
    return GemFactory.getType(gemList, item.type, iterations);
  }
};

exports.GemFactory = GemFactory;

/***/ }),

/***/ 1083:
/*!***********************************!*\
  !*** ./src/components/Badrock.ts ***!
  \***********************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

const Gem_1 = __webpack_require__(/*! ./Gem */ 212);

class Badrock extends Gem_1.Gem {
  constructor(cObj) {
    super(cObj);
  }

  setup() {}

}

exports.Badrock = Badrock;

/***/ }),

/***/ 1084:
/*!********************************!*\
  !*** ./src/components/Grid.ts ***!
  \********************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

class Coordenate {}

exports.Coordenate = Coordenate;

class Grid {
  constructor(coordenate) {
    this.populate = fillFunction => {
      for (let c = 0; c < this.numberOfColumns; c++) {
        for (let l = 0; l < this.numberOfRows; l++) {
          let item = fillFunction({
            column: c,
            row: l
          });
          this._columns[c][l] = item;
        }
      }

      for (let l = 0; l < this.numberOfColumns; l++) {
        for (let c = 0; c < this.numberOfRows; c++) {
          this._row[l][c] = this._columns[c][l];
        }
      }
    };

    this.row = index => {
      return this._row[index];
    };

    this.column = index => {
      return this._columns[index];
    };

    this.cell = coordenate => {
      return this._columns[coordenate.column][coordenate.row];
    };

    this.setCell = (coordenate, value) => {
      this._columns[coordenate.column][coordenate.row] = value;
      this._row[coordenate.row][coordenate.column] = value;
    };

    this.sort = func => {
      this._columns.forEach(column => {
        column.sort(func);
      });

      for (let l = 0; l < this.numberOfColumns; l++) {
        for (let c = 0; c < this.numberOfRows; c++) {
          this._row[l][c] = this._columns[c][l];
        }
      }
    };

    this.createEmptyList = size => {
      let list = [];

      for (let i = 0; i < size; i++) {
        list.push([]);
      }

      ;
      return list;
    };

    this.numberOfColumns = coordenate.column;
    this.numberOfRows = coordenate.row;
    this._columns = this.createEmptyList(this.numberOfColumns);
    this._row = this.createEmptyList(this.numberOfRows);
  }

  get rows() {
    return this._row.map(e => e.map(g => g));
  }

  get columns() {
    return this._columns.map(e => e.map(g => g));
  }

}

exports.Grid = Grid;

/***/ }),

/***/ 1085:
/*!*********************************!*\
  !*** ./src/components/Score.ts ***!
  \*********************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(/*! phaser */ 54);

const Resources_1 = __webpack_require__(/*! ./Resources */ 211);

class ScoreConstructor {}

class Score {
  constructor(cObj) {
    this.inc = value => {
      this.score += value;
      this.text.setText("SCORE: " + ("000000" + this.score).slice(-6));
    };

    this.score = 0;
    this.x = cObj.x;
    this.y = cObj.y;
    this.scene = cObj.scene;
    this.panel = cObj.scene.add.image(cObj.x, cObj.y, Resources_1.Resources.scorePanel.name);
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

}

exports.Score = Score;

/***/ }),

/***/ 1087:
/*!***********************************!*\
  !*** ./src/components/GemType.ts ***!
  \***********************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

const Resources_1 = __webpack_require__(/*! ./Resources */ 211);

var GemType;

(function (GemType) {
  GemType[GemType["blue"] = 0] = "blue";
  GemType[GemType["red"] = 1] = "red";
  GemType[GemType["green"] = 2] = "green";
  GemType[GemType["yellow"] = 3] = "yellow";
  GemType[GemType["badrock"] = 4] = "badrock";
})(GemType = exports.GemType || (exports.GemType = {}));

class GemResource {}

exports.GemResource = GemResource;
exports.GEM_LIST = [{
  type: GemType.blue,
  res: Resources_1.Resources.diamondBlue,
  rare: 0
}, {
  type: GemType.red,
  res: Resources_1.Resources.diamondRed,
  rare: 0
}, {
  type: GemType.green,
  res: Resources_1.Resources.diamondGreen,
  rare: 0
}, {
  type: GemType.yellow,
  res: Resources_1.Resources.diamondYellow,
  rare: 0
}, {
  type: GemType.badrock,
  res: Resources_1.Resources.badrock,
  rare: 1
}];

/***/ }),

/***/ 211:
/*!*************************************!*\
  !*** ./src/components/Resources.ts ***!
  \*************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(/*! phaser */ 54);

const IMAGE_PATH = "./assets/";

class Resource {
  constructor(name, url) {
    this.name = name;
    this.url = url;
  }

}

exports.Resource = Resource;

class Resources {}

Resources.load = (scene, res) => {
  scene.load.image(res.name, res.url);
};

Resources.background = new Resource("background", IMAGE_PATH + "background.png");
Resources.diamondBlue = new Resource("diamondBlue", IMAGE_PATH + "diamond_blue.png");
Resources.diamondRed = new Resource("diamondRed", IMAGE_PATH + "diamond_red.png");
Resources.diamondGreen = new Resource("diamondGreen", IMAGE_PATH + "diamond_green.png");
Resources.diamondYellow = new Resource("diamondYellow", IMAGE_PATH + "diamond_yellow.png");
Resources.badrock = new Resource("badrock", IMAGE_PATH + "diamond_gray.png");
Resources.scorePanel = new Resource("scorePanel", IMAGE_PATH + "score_panel.png");
exports.Resources = Resources;

/***/ }),

/***/ 212:
/*!*******************************!*\
  !*** ./src/components/Gem.ts ***!
  \*******************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(/*! phaser */ 54);

const Events_1 = __webpack_require__(/*! ./Events */ 436);

class GemFactoryonstructor {}

exports.GemFactoryonstructor = GemFactoryonstructor;

class GemConstructor extends GemFactoryonstructor {}

exports.GemConstructor = GemConstructor;

class MoveTo {}

class Gem {
  constructor(cObj) {
    this.disabled = false;

    this.moveTo = (obj, moveSprite = true) => {
      this._x = obj.x;
      this._y = obj.y;
      this._row = obj.row;
      this._column = obj.column;

      if (moveSprite) {
        this.backToGridPosition();
      }

      ;
    };

    this.fallTo = (y, row) => {
      this._row = row;
      this._y = y;
      this.tween = this.scene.add.tween({
        targets: [this.sprite],
        ease: 'Sine.Quadratic.Out',
        duration: 200 + y - this.sprite.y,
        delay: 0,
        y: {
          getStart: () => this.sprite.y,
          getEnd: () => y
        }
      });
    };

    this.backToGridPosition = () => {
      this.tween = this.scene.add.tween({
        targets: [this.sprite],
        ease: 'Sine.easeInOut',
        duration: 100 + (Math.abs(this.sprite.y - this._y) + Math.abs(this.sprite.x - this._y)) / 2,
        delay: 0,
        y: {
          getStart: () => this.sprite.y,
          getEnd: () => this._y
        },
        x: {
          getStart: () => this.sprite.x,
          getEnd: () => this._x
        }
      });
    };

    this.disableClick = () => {
      /*
          The only line really working here is the last one
          idk why, but on mobile the first 2 lines have no effect
      */
      this.sprite.setInteractive(false);
      this.sprite.on("pointerdown", () => {});
      this.disabled = true;
    };

    this.destroy = () => {
      this.tween = this.scene.add.tween({
        targets: [this.sprite],
        ease: 'Sine.easeInOut',
        duration: 500,
        delay: 0,
        alpha: {
          getStart: () => this.sprite.alpha,
          getEnd: () => 0
        },
        scaleX: {
          getStart: () => this.sprite.scaleX,
          getEnd: () => 0.1
        },
        scaleY: {
          getStart: () => this.sprite.scaleY,
          getEnd: () => 0.1
        },
        onComplete: () => {
          this.sprite.destroy();
        }
      });
    };

    this.calcPossibleMoves = () => {
      let maxBoudaryColumns = this.grid.columns.length;
      let maxBoudaryRows = this.grid.rows.length;
      let moves = [];

      if (this.column - 1 > -1) {
        //move to the left
        moves.push({
          column: this.column - 1,
          row: this.row
        });
      }

      ;

      if (this.column + 1 < maxBoudaryColumns) {
        //move to the right
        moves.push({
          column: this.column + 1,
          row: this.row
        });
      }

      ;

      if (this.row - 1 > -1) {
        //move to the top
        moves.push({
          column: this.column,
          row: this.row - 1
        });
      }

      ;

      if (this.row + 1 < maxBoudaryRows) {
        //move to the bottom
        moves.push({
          column: this.column,
          row: this.row + 1
        });
      }

      ;
      return moves;
    };

    this.type = cObj.type;
    this.grid = cObj.grid;
    this.sprite = cObj.scene.add.image(cObj.x, cObj.y, cObj.typeName);
    this.sprite.visible = cObj.visible;
    this._column = cObj.column;
    this._row = cObj.row;
    this.scene = cObj.scene;
    this._x = cObj.x;
    this._y = cObj.y;
    this.setup();
  }

  setup() {
    this.sprite.setInteractive();
    this.sprite.on("pointerdown", () => {
      if (!this.disabled) {
        this.scene.children.bringToTop(this.sprite);
        this.scene.sys.events.emit(Events_1.Events.gemClick, this);
      }
    });
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

}

exports.Gem = Gem;

/***/ }),

/***/ 436:
/*!**********************************!*\
  !*** ./src/components/Events.ts ***!
  \**********************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var Events;

(function (Events) {
  Events[Events["gemClick"] = 0] = "gemClick";
})(Events = exports.Events || (exports.Events = {}));

/***/ }),

/***/ 437:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /home/willian/dev/js/phaser/phaser3Typescript/src/main.ts */438);


/***/ }),

/***/ 438:
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(/*! phaser */ 54);

const PlayScene_1 = __importDefault(__webpack_require__(/*! ./scenes/PlayScene */ 1079));

const config = {
  type: Phaser.AUTO,
  parent: 'content',
  width: 430,
  height: 530,
  resolution: 1,
  transparent: true,
  pixelArt: true,
  scene: [PlayScene_1.default]
};
new Phaser.Game(config);

/***/ })

},[437]);
//# sourceMappingURL=bundle.js.map