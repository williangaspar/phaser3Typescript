import 'phaser';
import { Gem } from "./Gem";
import { MatchSequenceHelper } from "./MatchSequenceHelper";

import { Grid, Coordenate } from "./Grid";
import { Resources } from './Resources';
import { Events } from './Events';

const SPACING = 70;

class GemGridConstructor {
    x: number;
    y: number;
    scene: Phaser.Scene;
}

export class GemGrid {
    private grid: Grid<Gem>;
    private x: number;
    private y: number;
    private scene: Phaser.Scene;

    constructor(cObj: GemGridConstructor) {

        this.grid = new Grid<Gem>({ column: 6, row: 6 });

        this.grid.populate((coordenate: Coordenate) => {
            let x = coordenate.column * SPACING + cObj.x;
            let y = coordenate.row * SPACING + cObj.y;
            let column = coordenate.column;
            let row = coordenate.row;
            let item = new Gem({ column, row, scene: cObj.scene, visible: true, x, y });
            return item;
        })

        this.x = cObj.x;
        this.y = cObj.y;
        this.scene = cObj.scene;

        Gem.GENERATE_BADROCK = true;
    }

    check = (): MatchSequenceHelper[] => {
        let matchListGrid: MatchSequenceHelper[] = [];

        this.searchSequenceOnGrid(this.grid.rows, matchListGrid);
        this.searchSequenceOnGrid(this.grid.columns, matchListGrid);

        return matchListGrid;
    }

    remove = (matchList: MatchSequenceHelper[]): Promise<any> => {
        matchList.forEach(matchItem => {
            let gemList = matchItem.list;
            gemList.forEach(gem => {
                let coordenate = { column: gem.column, row: gem.row };

                if (this.grid.cell(coordenate) != null) {
                    gem.destroy();
                };

                this.grid.setCell(coordenate, null);
            });
        });

        return new Promise((resolve) => {
            setTimeout(() => { this.fall(); resolve() }, 500);
        });
    }

    repopulate = () => {
        this.grid.columns.forEach((column, cIdx) => {
            column.forEach((item, lIdx) => {
                if (!item) {
                    let xBegin = cIdx * SPACING + this.x;
                    let yBegin = -((column.length - lIdx) * SPACING);
                    let newItem = new Gem({ column: cIdx, row: lIdx, scene: this.scene, visible: true, x: xBegin, y: yBegin });

                    let yFinal = lIdx * SPACING + this.y;
                    this.grid.setCell({ column: cIdx, row: lIdx }, newItem);

                    newItem.fallTo(yFinal, newItem.row);
                };
            });
        });
    }

    overLappingWith = (gem: Gem, position: Phaser.Math.Vector2): Gem => {
        let possibleMoves = this.calcPossibleMoves(gem);

        for (let i = 0; i < possibleMoves.length; i++) {
            let m = possibleMoves[i];
            let overlapItem = this.grid.cell({ column: m.column, row: possibleMoves[i].row });

            if (overlapItem && overlapItem.type != Resources.badrock.name) {
                let width = overlapItem.sprite.width / 2 - 10;
                let height = overlapItem.sprite.height / 2 - 10;

                let xBoundary = [overlapItem.x - width, overlapItem.x + width];
                let yBoundary = [overlapItem.y - height, overlapItem.y + height];

                let xOverlapping = position.x > xBoundary[0] && position.x < xBoundary[1];
                let yOverlapping = position.y > yBoundary[0] && position.y < yBoundary[1];
                let isOverlapping = xOverlapping && yOverlapping;

                if (isOverlapping) {
                    return overlapItem;
                };
            };
        };
    }

    swapPosition = (gem1: Gem, gem2: Gem, doMoveSprite: boolean = true): Promise<any> => {
        let x1 = gem1.x;
        let y1 = gem1.y;
        let column1 = gem1.column;
        let row1 = gem1.row;
        let m1: Coordenate = { column: column1, row: row1 };

        let x2 = gem2.x;
        let y2 = gem2.y;
        let column2 = gem2.column;
        let row2 = gem2.row;
        let m2: Coordenate = { column: column2, row: row2 };

        this.grid.setCell(m2, gem1);
        this.grid.setCell(m1, gem2);

        gem1.moveTo({ x: x2, y: y2, row: row2, column: column2 }, doMoveSprite);
        gem2.moveTo({ x: x1, y: y1, row: row1, column: column1 }, doMoveSprite);

        return new Promise((resolve) => {
            setTimeout(() => { resolve() }, 500);
        });
    }

    isGameOver = (): boolean => {

        /*
            This is not a very optimized solution since we will have a lot of
            overlapping check, but it will still been fast sice we don't have
            that many columns and rows
         */
        for (let c = 0; c < this.grid.columns.length; c++) {
            let column = this.grid.columns[c];
            for (let r = 0; r < column.length; r++) {

                let gem = this.grid.cell({ column: c, row: r });
                let possibleMoves = this.calcPossibleMoves(gem);

                // check if any move will result in a match
                for (let i = 0; i < possibleMoves.length; i++) {
                    let m = possibleMoves[i];
                    let swapGem = this.grid.cell({ column: m.column, row: possibleMoves[i].row });

                    if (!(gem.type == Resources.badrock.name || swapGem.type == Resources.badrock.name)) {
                        let matchListGrid: MatchSequenceHelper[] = [];
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
        }

        // if no move will result in a match, the game is over!
        return true;

    }

    replaceBadrock = (): Promise<any> => {
        Gem.GENERATE_BADROCK = false;

        return new Promise((resolve) => {
            this.grid.columns.forEach((column, cIdx) => {
                column.forEach((item, lIdx) => {
                    if (item.type == Resources.badrock.name) {
                        item.destroy();
                        this.grid.setCell({ column: cIdx, row: lIdx }, null);

                        setTimeout(() => {
                            this.fall();
                            this.repopulate();
                        }, 500);

                    };
                });
            });
            setTimeout(() => {
                Gem.GENERATE_BADROCK = true;
                resolve();
            }, 1500);
        });
    }

    disableGems = () => {
        this.grid.columns.forEach((column) => {
            column.forEach((item) => {
                item.disableClick();
            });
        });
    }

    private searchSequenceOnGrid = (grid: Gem[][], matchListGrid: MatchSequenceHelper[]) => {
        grid.forEach((e) => {
            let matchList: MatchSequenceHelper[] = this.searchSequenceOnList(e, 0, []);

            if (matchList.length) {
                matchListGrid.push(...matchList);
            };
        });
    }

    private searchSequenceOnList = (list: Gem[], index: number, matchList: MatchSequenceHelper[]): MatchSequenceHelper[] => {
        let item = list[index];
        let matchItem = matchList.filter(e => e.type == item.type);

        if (matchItem.length) {
            matchItem[0].add(item);
        }
        else if (item.type != Resources.badrock.name) {
            let newMatchItem = new MatchSequenceHelper(item);
            matchList.push(newMatchItem);
        };

        if (index < list.length - 1) {
            index++;
            return this.searchSequenceOnList(list, index, matchList);
        } else {
            matchList = matchList.filter(e => {
                e.end();
                return e.size();
            });

            return matchList;
        };
    }

    private fall = () => {
        this.grid.sort((a: Gem, b: Gem) => {
            let aValue = a ? 1 : -1;
            let bValue = b ? 1 : -1;
            return aValue - bValue;
        });

        this.grid.columns.forEach((column) => {
            column.forEach((item, index) => {
                if (item) {
                    item.fallTo(index * SPACING + this.y, index);
                }
            });
        });
    }

    private calcPossibleMoves = (gem: Gem): Coordenate[] => {
        let maxBoudaryColumns = this.grid.columns.length;
        let maxBoudaryRows = this.grid.rows.length;

        let moves: Coordenate[] = [];

        if (gem.column - 1 > -1) { //move to the left
            moves.push({ column: gem.column - 1, row: gem.row });
        };

        if (gem.column + 1 < maxBoudaryColumns) { //move to the right
            moves.push({ column: gem.column + 1, row: gem.row });
        };

        if (gem.row - 1 > -1) { //move to the top
            moves.push({ column: gem.column, row: gem.row - 1 });
        };

        if (gem.row + 1 < maxBoudaryRows) { //move to the bottom
            moves.push({ column: gem.column, row: gem.row + 1 });
        };

        return moves;
    }
}

