export class Coordenate {
    row: number;
    column: number;
}

export class Cell<T> extends Coordenate {
    item: T;
}

export class Grid<T> {
    private _rows: Cell<T>[][];
    private _columns: Cell<T>[][];

    readonly numberOfColumns: number;
    readonly numberOfRows: number;

    constructor(coordenate: Coordenate) {
        this.numberOfColumns = coordenate.column;
        this.numberOfRows = coordenate.row;

        this._columns = this.createEmptyList(this.numberOfColumns);
        this._rows = this.createEmptyList(this.numberOfRows);
    }

    populate = (fillFunction: (c: Coordenate) => T) => {
        for (let c = 0; c < this.numberOfColumns; c++) {
            for (let r = 0; r < this.numberOfRows; r++) {
                let coordenate: Coordenate = { column: c, row: r };
                let item = fillFunction(coordenate);
                this._columns[c][r] = { ...coordenate, item };
            }
        }

        for (let r = 0; r < this.numberOfColumns; r++) {
            for (let c = 0; c < this.numberOfRows; c++) {
                this._rows[r][c] = this._columns[c][r];
            }
        }
    }

    row = (index: number): Cell<T>[] => {
        return this._rows[index];
    }

    column = (index: number): Cell<T>[] => {
        return this._columns[index];
    }

    cell = (coordenate: Coordenate): Cell<T> => {
        return this._columns[coordenate.column][coordenate.row];
    }


    setCell = (coordenate: Coordenate, item: T) => {
        this._columns[coordenate.column][coordenate.row].item = item;
        this._rows[coordenate.row][coordenate.column].item = item;
    }

    get rows(): Cell<T>[][] {
        return this._rows.map((e) => e.map((g) => g));
    }

    get columns(): Cell<T>[][] {
        return this._columns.map((e) => e.map((g) => g));
    }

    sortColumns = (func: (a: Cell<T>, b: Cell<T>) => number) => {
        this.sortArrays(func, this._columns, this._rows);
    }

    sortRows = (func: (a: Cell<T>, b: Cell<T>) => number) => {
        this.sortArrays(func, this._rows, this._columns);
    }

    filter = (func: (e: Cell<T>) => boolean) => {
        let list: Cell<T>[] = [];
        for (let r = 0; r < this.numberOfColumns; r++) {
            for (let c = 0; c < this.numberOfRows; c++) {
                if (func(this._columns[c][r])) {
                    list.push(this._columns[c][r]);
                };
            };
        };

        return list;
    }

    all = () => {
        let list: Cell<T>[] = [];
        for (let r = 0; r < this.numberOfColumns; r++) {
            for (let c = 0; c < this.numberOfRows; c++) {
                list.push(this._columns[c][r]);
            };
        };

        return list;
    }

    private sortArrays = (func: (a: Cell<T>, b: Cell<T>) => number, array1: Cell<T>[][], array2: Cell<T>[][]) => {
        array1.forEach((item) => {
            item.sort(func);
        });

        for (let c = 0; c < array1.length; c++) {
            for (let r = 0; r < array2.length; r++) {
                let coordenate: Coordenate = { column: c, row: r };
                array1[c][r] = { ...coordenate, item: array1[c][r].item };
            }
        };

        for (let r = 0; r < array2.length; r++) {
            for (let c = 0; c < array1.length; c++) {
                array2[r][c] = array1[c][r];
            }
        };
    }

    private createEmptyList = (size: number): Cell<T>[][] => {
        let list = [];
        for (let i = 0; i < size; i++) {
            list.push([]);

        };
        return list;
    }
}
