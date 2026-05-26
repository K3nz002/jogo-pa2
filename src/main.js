import { MapaScene } from './scenes/map.js';

const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    pixelArt: true, // Mantém os pixels nítidos (estilo Stardew)
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Jogo top-down não tem gravidade para baixo
            debug: true // Ative como true para ver as caixas de colisão no início
        }
    },
    scene: [MapaScene] // Sua cena principal de exploração
};

const game = new Phaser.Game(config);