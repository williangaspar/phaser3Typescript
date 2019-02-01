import { Gem } from "./Gem";
import { GemType } from "./GemType";

export class MatchSequenceHelper {
    public type: GemType;
    private currentList: Gem[];
    private matchList: Gem[];
    constructor(gem: Gem) {
        this.type = gem.type;
        this.currentList = [gem];
        this.matchList = [];

    }

    add = (gem: Gem) => {
        let lastElement = this.currentList[this.currentList.length - 1];
        if (gem.cell.row > lastElement.cell.row + 1 || gem.cell.column > lastElement.cell.column + 1) { // ideintify a gap. Like: B B Y B
            this.end();
        }

        this.currentList.push(gem);
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
