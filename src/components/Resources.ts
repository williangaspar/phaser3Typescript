import 'phaser';

const IMAGE_PATH = "./assets/";

class Resource {
    public name: string;
    public url: string;

    constructor(name: string, url: string) {
        this.name = name;
        this.url = url;
    }
}

class Resources {
    static load = (scene: Phaser.Scene, res: Resource) => {
        scene.load.image(res.name, res.url);
    }

    public static readonly background = new Resource("background", IMAGE_PATH + "background.png");
    public static readonly diamondBlue = new Resource("diamondBlue", IMAGE_PATH + "diamond_blue.png");
    public static readonly diamondRed = new Resource("diamondRed", IMAGE_PATH + "diamond_red.png");
    public static readonly diamondGreen = new Resource("diamondGreen", IMAGE_PATH + "diamond_green.png");
    public static readonly diamondYellow = new Resource("diamondYellow", IMAGE_PATH + "diamond_yellow.png");
    public static readonly badrock = new Resource("badrock", IMAGE_PATH + "diamond_gray.png");
    public static readonly scorePanel = new Resource("scorePanel", IMAGE_PATH + "score_panel.png");
}


export { Resource, Resources };
