/**
 * BootScene — Pré-carregamento global de assets.
 * Carrega todos os arquivos JSON e exibe uma tela de loading estilizada.
 */
export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const { width, height } = this.scale;

        // Tela de Loading
        this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a);

        // Título
        this.add.text(width / 2, height / 2 - 80, 'AINDA À ESPERA', {
            fontSize: '52px',
            fontFamily: "'Courier New', monospace",
            color: '#6366f1',
            letterSpacing: 10,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 20, 'Um Jogo de Investigação Criminal', {
            fontSize: '20px',
            fontFamily: "'Courier New', monospace",
            color: '#475569',
            letterSpacing: 3
        }).setOrigin(0.5);

        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 + 50, 'Carregando...', {
            fontSize: '18px',
            fontFamily: "'Courier New', monospace",
            color: '#94a3b8'
        }).setOrigin(0.5);

        // Barra de progresso
        const barBg = this.add.rectangle(width / 2, height / 2 + 100, 500, 10, 0x1e293b).setOrigin(0.5);
        const barFill = this.add.rectangle(width / 2 - 250, height / 2 + 100, 2, 10, 0x6366f1).setOrigin(0, 0.5);

        this.load.on('progress', (value) => {
            barFill.setSize(500 * value, 10);
        });

        this.load.on('fileprogress', (file) => {
            loadingText.setText(`Carregando: ${file.key}...`);
        });

        // Carregar dados do jogo
        this.load.json('dialogos', 'assets/dialogos.json');
        this.load.json('pistas',   'assets/pistas.json');

        // Sprites de NPCs
        this.load.image('npc-2', 'assets/sprites/NPC-2.png');

        // Áudio (adicionar arquivos .mp3/.wav em assets/audio/ quando disponíveis)
        // this.load.audio('musica_menu',     'assets/audio/menu.mp3');
        // this.load.audio('musica_suspense', 'assets/audio/suspense.mp3');
        // this.load.audio('sfx_pista',       'assets/audio/pista.wav');
        // this.load.audio('sfx_acerto',      'assets/audio/acerto.wav');
        // this.load.audio('sfx_erro',        'assets/audio/erro.wav');
    }

    create() {
        // Pequena pausa para o efeito visual
        this.time.delayedCall(300, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });
    }
}
