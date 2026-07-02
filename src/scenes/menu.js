/**
 * MenuScene — Tela de menu principal animada.
 */
import { GameState } from '../utils/GameState.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Reset state ao voltar ao menu
        GameState.reset();

        // --- Fundo ---
        this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a);

        // Linhas de varredura decorativas
        const g = this.add.graphics();
        g.lineStyle(1, 0x1e293b, 0.6);
        for (let y = 0; y < height; y += 6) {
            g.moveTo(0, y);
            g.lineTo(width, y);
        }
        g.strokePath();

        // Decoração: linhas verticais laterais
        this.add.rectangle(80, height / 2, 3, height * 0.6, 0x6366f1, 0.3);
        this.add.rectangle(width - 80, height / 2, 3, height * 0.6, 0x6366f1, 0.3);

        // --- Badge do título ---
        const badgeBg = this.add.rectangle(width / 2, height / 2 - 160, 740, 190, 0x1e293b, 0.9);
        badgeBg.setStrokeStyle(2, 0x6366f1, 0.7);

        // Pontos decorativos nos cantos do badge
        [[-355, -215], [355, -215], [-355, -105], [355, -105]].forEach(([ox, oy]) => {
            this.add.circle(width / 2 + ox, height / 2 + oy, 5, 0x6366f1, 0.5);
        });

        // Título
        const titulo = this.add.text(width / 2, height / 2 - 200, 'AINDA À ESPERA', {
            fontSize: '74px',
            fontFamily: "'Courier New', monospace",
            color: '#f8fafc',
            letterSpacing: 14,
            fontStyle: 'bold',
            stroke: '#6366f1',
            strokeThickness: 2
        }).setOrigin(0.5).setAlpha(0);

        const subtitulo = this.add.text(width / 2, height / 2 - 130, 'UM JOGO DE INVESTIGAÇÃO CRIMINAL', {
            fontSize: '19px',
            fontFamily: "'Courier New', monospace",
            color: '#6366f1',
            letterSpacing: 5
        }).setOrigin(0.5).setAlpha(0);

        // Introdução da história
        const intro = this.add.text(width / 2, height / 2 - 20,
            'Uma mulher desapareceu e o principal suspeito é o marido. Você tem 3 dias para\n' +
            'descobrir o que aconteceu. Colete pistas, interrogue suspeitos e faça a justiça.',
            {
                fontSize: '19px',
                fontFamily: "'Courier New', monospace",
                color: '#94a3b8',
                align: 'center',
                lineSpacing: 10
            }
        ).setOrigin(0.5).setAlpha(0);

        // Botão Jogar
        const btnBg = this.add.rectangle(width / 2, height / 2 + 160, 320, 65, 0x6366f1)
            .setInteractive({ useHandCursor: true })
            .setAlpha(0);
        const btnText = this.add.text(width / 2, height / 2 + 160, '▶  INICIAR INVESTIGAÇÃO', {
            fontSize: '19px',
            fontFamily: "'Courier New', monospace",
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);

        // Controles
        const controles = this.add.text(width / 2, height / 2 + 255,
            'SETAS / WASD: Mover   •   CLIQUE: Interagir   •   I: Inventário   •   N: Caderno',
            {
                fontSize: '14px',
                fontFamily: "'Courier New', monospace",
                color: '#334155'
            }
        ).setOrigin(0.5);

        // Animações de entrada
        this.tweens.add({ targets: titulo, alpha: 1, duration: 900, ease: 'Power2' });
        this.tweens.add({ targets: subtitulo, alpha: 1, duration: 900, delay: 200, ease: 'Power2' });
        this.tweens.add({ targets: intro, alpha: 1, duration: 800, delay: 700, ease: 'Power2' });
        this.tweens.add({ targets: [btnBg, btnText], alpha: 1, duration: 600, delay: 1200, ease: 'Power2' });

        // Pulsação no botão
        this.tweens.add({
            targets: btnText, alpha: 0.65, yoyo: true, repeat: -1,
            duration: 1300, ease: 'Sine.easeInOut', delay: 2000
        });

        // Hover do botão
        btnBg.on('pointerover', () => {
            this.tweens.add({ targets: [btnBg, btnText], scaleX: 1.04, scaleY: 1.04, duration: 150 });
            btnBg.setFillStyle(0x4f46e5);
        });
        btnBg.on('pointerout', () => {
            this.tweens.add({ targets: [btnBg, btnText], scaleX: 1, scaleY: 1, duration: 150 });
            btnBg.setFillStyle(0x6366f1);
        });
        btnBg.on('pointerdown', () => {
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MapaScene');
            });
        });

        this.cameras.main.fadeIn(600);
    }
}
