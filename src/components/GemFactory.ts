import "phaser";
import { Gem, GemFactoryConstructor } from "./Gem";
import { Bedrock } from "./Bedrock";
import { GemResource, GEM_LIST, GemType } from "./GemType";
import { Bomb } from "./Bomb";

export class GemFactory {
    static getGem = (gemConstructor: GemFactoryConstructor, exclude: GemType[] = []): Gem => {
        let gemList = GEM_LIST.filter((g) => !exclude.some(e => e == g.type));
        let item = GemFactory.getType(gemList);

        if (item.type == GemType.bedrock) {
            return new Bedrock({ ...gemConstructor, typeName: item.res.name, type: item.type });
        } else if (item.type == GemType.bomb) {
            return new Bomb({ ...gemConstructor, typeName: item.res.name, type: item.type });
        } else {
            return new Gem({ ...gemConstructor, typeName: item.res.name, type: item.type });
        }
    }

    private static getType = (gemList: GemResource[], lastType: GemType = null, iterations: number = 0): GemResource => {
        let type = Phaser.Math.Between(0, gemList.length - 1);
        let item = gemList[type];
        if (item.rare == 0 || (item.rare <= iterations)) {
            return item;
        } else {
            iterations = (lastType == item.type || lastType == null) ? iterations + 1 : 1;
            return GemFactory.getType(gemList, item.type, iterations);
        }

    }
}
