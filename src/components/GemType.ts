import { Resource, Resources } from "./Resources";

export enum GemType {
    blue, red, green, yellow, bedrock, bomb
}

export class GemResource {
    type: GemType;
    res: Resource;
    rare: number;
}

export const GEM_LIST: GemResource[] = [
    { type: GemType.blue, res: Resources.diamondBlue, rare: 0 },
    { type: GemType.red, res: Resources.diamondRed, rare: 0 },
    { type: GemType.green, res: Resources.diamondGreen, rare: 0 },
    { type: GemType.yellow, res: Resources.diamondYellow, rare: 0 },
    { type: GemType.bedrock, res: Resources.bedrock, rare: 1 },
    { type: GemType.bomb, res: Resources.bomb, rare: 2 },
]
