/**
 * main.js — Ponto de entrada do jogo.
 * Registra todas as cenas e inicializa a instância do Phaser.
 */
import { BootScene }      from './scenes/boot.js';
import { MenuScene }      from './scenes/menu.js';
import { MapaScene }      from './scenes/map.js';
import { DialogueScene }  from './scenes/dialogue.js';
import { InventoryScene } from './scenes/inventory.js';
import { PuzzleScene }    from './scenes/puzzle.js';
import { JulgamentoScene } from './scenes/julgamento.js';

const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    pixelArt: false,
    backgroundColor: '#070c14',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        MenuScene,
        MapaScene,
        DialogueScene,
        InventoryScene,
        PuzzleScene,
        JulgamentoScene
    ]
};

const game = new Phaser.Game(config);