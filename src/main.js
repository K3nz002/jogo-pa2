/**
 * main.js — Ponto de entrada do jogo.
 * Registra todas as cenas e inicializa a instância do Phaser.
 */
import { BootScene }       from './scenes/boot.js';
import { MenuScene }       from './scenes/menu.js';
import { TutorialScene }   from './scenes/tutorial.js';
import Cena02 from './scenes/cena2.js';
import { Cena3Scene }      from './scenes/cena3.js';       
import { MapaScene }       from './scenes/map.js';
import { DialogueScene }   from './scenes/dialogue.js';
import { InventoryScene }  from './scenes/inventory.js';
import { PuzzleScene }     from './scenes/puzzle.js';
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
        TutorialScene,
        Cena02,
        Cena3Scene,        
        MapaScene,
        DialogueScene,
        InventoryScene,
        PuzzleScene,
        JulgamentoScene
    ]
};

const game = new Phaser.Game(config);
