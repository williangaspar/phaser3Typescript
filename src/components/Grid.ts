export class Coordenate {
    row: number;
    column: number;
}

export class Grid<T> {
    private _row: T[][];
    private _columns: T[][];

    private numberOfColumns: number;
    private numberOfRows: number;

    constructor(coordenate: Coordenate) {
        this.numberOfColumns = coordenate.column;
        this.numberOfRows = coordenate.row;

        this._columns = this.createEmptyList(this.numberOfColumns);
        this._row = this.createEmptyList(this.numberOfRows);
    }

    populate = (fillFunction: Function) => {
        for (let c = 0; c < this.numberOfColumns; c++) {
            for (let l = 0; l < this.numberOfRows; l++) {
                let item = fillFunction({ column: c, row: l });
                this._columns[c][l] = item;
            }
        }

        for (let l = 0; l < this.numberOfColumns; l++) {
            for (let c = 0; c < this.numberOfRows; c++) {
                this._row[l][c] = this._columns[c][l];
            }
        }
    }

    row = (index: number): T[] => {
        return this._row[index];
    }

    column = (index: number): T[] => {
        return this._columns[index];
    }

    cell = (coordenate: Coordenate): T => {
        return this._columns[coordenate.column][coordenate.row];
    }

    setCell = (coordenate: Coordenate, value: T) => {
        this._columns[coordenate.column][coordenate.row] = value;
        this._row[coordenate.row][coordenate.column] = value;
    }

    get rows(): T[][] {
        return this._row.map((e) => e.map((g) => g));
    }

    get columns(): T[][] {
        return this._columns.map((e) => e.map((g) => g));
    }

    sort = (func: (a: T, b: T) => number) => {
        this._columns.forEach((column) => {
            column.sort(func);
        });

        for (let l = 0; l < this.numberOfColumns; l++) {
            for (let c = 0; c < this.numberOfRows; c++) {
                this._row[l][c] = this._columns[c][l];
            }
        }
    }

    filter = (func: (e: T) => boolean) => {
        let list: T[] = [];
        for (let l = 0; l < this.numberOfColumns; l++) {
            for (let c = 0; c < this.numberOfRows; c++) {
                if (func(this._columns[c][l])) {
                    list.push(this._columns[c][l]);
                };
            };
        };

        return list;
    }

    private createEmptyList = (size: number): T[][] => {
        let list = [];
        for (let i = 0; i < size; i++) {
            list.push([]);

        };
        return list;
    }
}
