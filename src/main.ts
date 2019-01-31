import 'phaser';

import GameScene from './scenes/PlayScene';

const config:GameConfig = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 430,
    height: 530,
    resolution: 1,
    transparent: true,
    pixelArt: true,
    scene: [
      GameScene
    ]
};

new Phaser.Game(config);

