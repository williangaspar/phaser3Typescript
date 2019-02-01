import 'phaser';
import { Resources, Resource } from "./Resources";
import { Gem, GemFactoryonstructor, GemType } from "./Gem";
import { Badrock } from "./Badrock";
import { Events } from "./Events";

class GemResource {
    type: GemType;
    res: Resource;
    rare: number;
}

const GEM_LIST: GemResource[] = [
    { type: GemType.blue, res: Resources.diamondBlue, rare: 0 },
    { type: GemType.red, res: Resources.diamondRed, rare: 0 },
    { type: GemType.green, res: Resources.diamondGreen, rare: 0 },
    { type: GemType.yellow, res: Resources.diamondYellow, rare: 0 },
    { type: GemType.badrock, res: Resources.badrock, rare: 1 },
]

export class GemFactory {
    static getGem = (gemConstructor: GemFactoryonstructor, exclude: GemType[] = []): Gem => {
        let gemList = GEM_LIST.filter((g) => !exclude.some(e => e == g.type));
        let item = GemFactory.getType(gemList);

        if (item.type == GemType.badrock) {
            return new Badrock({ ...gemConstructor, typeName: item.res.name, type: item.type });
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
            iterations = (lastType == item.type || lastType == null) ? iterations + 1 : 0;
            return GemFactory.getType(gemList, item.type, iterations);
        }

    }
}
