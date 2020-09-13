import Phaser from './lib/phaser.js';
import Game from './scenes/Game.js';


export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 1400,
    height: 900,
    scene: Game,
});
