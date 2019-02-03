import "phaser";
import { Gem } from "./Gem";
import { MatchSequenceHelper } from "./MatchSequenceHelper";
import { GemFactory } from "./GemFactory";
import { Grid, Coordenate, Cell } from "./Grid";
import { GemType } from './GemType';

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

        this.grid.populate((cell: Coordenate) => {
            let x = cell.column * SPACING + cObj.x;
            let y = cell.row * SPACING + cObj.y;
            let grid = this.grid;
            let item = GemFactory.getGem({ cell, scene: cObj.scene, visible: true, x, y, grid }, [GemType.bedrock]);
            return item;
        })

        this.x = cObj.x;
        this.y = cObj.y;
        this.scene = cObj.scene;
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
                if (this.grid.cell(gem.cell).item != null) {
                    gem.destroy();
                };

                this.grid.setCell(gem.cell, null);
            });
        });

        return new Promise((resolve) => {
            setTimeout(() => { this.fall(); resolve() }, 500);
        });
    }

    repopulate = (excludeList: GemType[] = []) => {
        this.grid.all().forEach((cell) => {
            if (!cell.item) {
                let xBegin = cell.column * SPACING + this.x;
                let yBegin = -((this.grid.numberOfRows - cell.row) * SPACING);

                let newItem = GemFactory.getGem(
                    { cell, scene: this.scene, visible: true, x: xBegin, y: yBegin, grid: this.grid },
                    excludeList
                );

                let yFinal = cell.row * SPACING + this.y;
                this.grid.setCell(cell, newItem);

                newItem.fallTo(yFinal, newItem.cell.row);
            };
        });
    }

    overLappingWith = (gem: Gem, position: Phaser.Math.Vector2): Gem => {
        let possibleMoves = gem.calcPossibleMoves();

        for (let i = 0; i < possibleMoves.length; i++) {
            let overlapItem = this.grid.cell(possibleMoves[i]).item;

            if (overlapItem && overlapItem.stackable) {
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
        let cell1 = gem1.cell;

        let x2 = gem2.x;
        let y2 = gem2.y;
        let cell2 = gem2.cell;

        this.grid.setCell(cell2, gem1);
        this.grid.setCell(cell1, gem2);

        gem1.moveTo({ x: x2, y: y2, cell: cell2 }, doMoveSprite);
        gem2.moveTo({ x: x1, y: y1, cell: cell1 }, doMoveSprite);

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
        let cells = this.grid.all();
        for (let g = 0; g < cells.length; g++) {
            let cell = cells[g];
            let gem = cell.item;
            let possibleMoves = gem.calcPossibleMoves();

            // check if any move will result in a match
            for (let i = 0; i < possibleMoves.length; i++) {
                let swapGem = this.grid.cell(possibleMoves[i]).item;

                if (swapGem.type == GemType.bomb) {
                    return false;
                }

                if (gem.stackable && swapGem.stackable) {
                    let matchListGrid: MatchSequenceHelper[] = [];
                    this.swapPosition(gem, swapGem, false);
                    this.searchSequenceOnGrid([this.grid.row(cell.row)], matchListGrid);
                    this.searchSequenceOnGrid([this.grid.column(cell.column)], matchListGrid);

                    if (matchListGrid.length) {
                        // if yes, just go on.
                        this.swapPosition(gem, swapGem);
                        return false;
                    }

                    this.swapPosition(gem, swapGem);
                }
            };
        };

        // if no move will result in a match, the game is over!
        return true;
    }

    replacebedrock = (): Promise<any> => {
        return new Promise((resolve) => {
            this.grid.all().forEach((cell) => {
                if (cell.item.type == GemType.bedrock) {
                    cell.item.destroy();
                    this.grid.setCell(cell, null);

                    setTimeout(() => {
                        this.fall();
                        this.repopulate([GemType.bedrock]);
                    }, 500);

                };
            });

            setTimeout(() => {
                resolve();
            }, 1500);
        });
    }

    disableGems = () => {
        this.grid.all().forEach((cell) => {
            cell.item.disableClick();
        });
    }

    fall = () => {
        this.grid.sortColumns((a: Cell<Gem>, b: Cell<Gem>) => {
            let aValue = a.item ? 1 : -1;
            let bValue = b.item ? 1 : -1;
            return aValue - bValue;
        });

        this.grid.all().forEach((cell) => {
            if (cell.item) {
                cell.item.fallTo(cell.row * SPACING + this.y, cell.row);
            };
        });
    }

    private searchSequenceOnGrid = (grid: Cell<Gem>[][], matchListGrid: MatchSequenceHelper[]) => {
        grid.forEach((e) => {
            let matchList: MatchSequenceHelper[] = this.searchSequenceOnList(e, 0, []);

            if (matchList.length) {
                matchListGrid.push(...matchList);
            };
        });
    }

    private searchSequenceOnList = (list: Cell<Gem>[], index: number, matchList: MatchSequenceHelper[]): MatchSequenceHelper[] => {
        let item = list[index].item;
        let matchItem = matchList.filter(e => e.type == item.type);

        if (matchItem.length) {
            matchItem[0].add(item);
        }
        else if (item.stackable) {
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
}

