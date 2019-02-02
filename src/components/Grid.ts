export class Coordenate {
    row: number;
    column: number;
}

export class Cell<T> extends Coordenate {
    item: T;
}

export class Grid<T> {
    private _row: Cell<T>[][];
    private _columns: Cell<T>[][];

    readonly numberOfColumns: number;
    readonly numberOfRows: number;

    constructor(coordenate: Coordenate) {
        this.numberOfColumns = coordenate.column;
        this.numberOfRows = coordenate.row;

        this._columns = this.createEmptyList(this.numberOfColumns);
        this._row = this.createEmptyList(this.numberOfRows);
    }

    populate = (fillFunction: (c: Coordenate) => T) => {
        for (let c = 0; c < this.numberOfColumns; c++) {
            for (let l = 0; l < this.numberOfRows; l++) {
                let coordenate: Coordenate = { column: c, row: l };
                let item = fillFunction(coordenate);
                this._columns[c][l] = { ...coordenate, item };
            }
        }

        for (let l = 0; l < this.numberOfColumns; l++) {
            for (let c = 0; c < this.numberOfRows; c++) {
                this._row[l][c] = this._columns[c][l];
            }
        }
    }

    row = (index: number): Cell<T>[] => {
        return this._row[index];
    }

    column = (index: number): Cell<T>[] => {
        return this._columns[index];
    }

    cell = (coordenate: Coordenate): Cell<T> => {
        return this._columns[coordenate.column][coordenate.row];
    }


    setCell = (coordenate: Coordenate, item: T) => {
        this._columns[coordenate.column][coordenate.row].item = item;
        this._row[coordenate.row][coordenate.column].item = item;
    }

    get rows(): Cell<T>[][] {
        return this._row.map((e) => e.map((g) => g));
    }

    get columns(): Cell<T>[][] {
        return this._columns.map((e) => e.map((g) => g));
    }

    sortColumnByItem = (func: (a: Cell<T>, b: Cell<T>) => number) => {
        this._columns.forEach((column) => {
            column.sort(func);
        });

        for (let c = 0; c < this.numberOfColumns; c++) {
            for (let l = 0; l < this.numberOfRows; l++) {
                let coordenate: Coordenate = { column: c, row: l };
                this._columns[c][l] = { ...coordenate, item: this._columns[c][l].item };
            }
        }

        for (let l = 0; l < this.numberOfColumns; l++) {
            for (let c = 0; c < this.numberOfRows; c++) {
                this._row[l][c] = this._columns[c][l];
            }
        }
    }

    filter = (func: (e: Cell<T>) => boolean) => {
        let list: Cell<T>[] = [];
        for (let l = 0; l < this.numberOfColumns; l++) {
            for (let c = 0; c < this.numberOfRows; c++) {
                if (func(this._columns[c][l])) {
                    list.push(this._columns[c][l]);
                };
            };
        };

        return list;
    }

    all = () => {
        let list: Cell<T>[] = [];
        for (let l = 0; l < this.numberOfColumns; l++) {
            for (let c = 0; c < this.numberOfRows; c++) {
                list.push(this._columns[c][l]);
            };
        };

        return list;
    }

    private createEmptyList = (size: number): Cell<T>[][] => {
        let list = [];
        for (let i = 0; i < size; i++) {
            list.push([]);

        };
        return list;
    }
}
