/**
 * DialogueScene — Cena overlay para diálogos com NPCs.
 * Lançada sobre a MapaScene via scene.launch(). A MapaScene é pausada
 * durante o diálogo e resumida ao encerrar.
 *
 * Dados recebidos via init(data):
 *   - npcId   {string}   — identificador do NPC
 *   - npcNome {string}   — nome de exibição
 *   - falas   {string[]} — linhas de diálogo
 */
export class DialogueScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DialogueScene' });
    }

    init(data) {
        this.npcId = data.npcId || 'desconhecido';
        this.npcNome = data.npcNome || 'NPC';
        this.falas = data.falas && data.falas.length > 0 ? data.falas : ['...'];
        this.indexAtual = 0;
        this._encerrado = false;
    }

    create() {
        const { width, height } = this.scale;
        const boxH = 210;
        const boxY = height - boxH / 2;

        // Overlay semitransparente no topo
        this.add.rectangle(width / 2, height / 2 - boxH / 2, width, height - boxH, 0x000000, 0.35);

        // Caixa de diálogo (inferior)
        const boxBg = this.add.rectangle(width / 2, boxY, width - 20, boxH, 0x0b1120, 0.97);
        boxBg.setStrokeStyle(2, 0x6366f1, 0.9);

        // Badge com nome do NPC
        this.add.rectangle(140, height - boxH + 28, 250, 38, 0x6366f1).setOrigin(0.5);
        this.nomeBadge = this.add.text(140, height - boxH + 28, this.npcNome.toUpperCase(), {
            fontSize: '13px',
            fontFamily: "'Courier New', monospace",
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Texto do diálogo
        this.dialogoText = this.add.text(
            30, height - boxH + 65, '',
            {
                fontSize: '19px',
                fontFamily: "'Courier New', monospace",
                color: '#e2e8f0',
                wordWrap: { width: width - 80 },
                lineSpacing: 7
            }
        ).setOrigin(0, 0);

        // Contador de linha
        this.counterText = this.add.text(width - 30, height - boxH + 18, '', {
            fontSize: '13px',
            fontFamily: "'Courier New', monospace",
            color: '#475569'
        }).setOrigin(1, 0.5);

        // Indicador de continuar
        this.continuarText = this.add.text(width - 30, height - 22, '▶  CLIQUE  /  ESPAÇO', {
            fontSize: '13px',
            fontFamily: "'Courier New', monospace",
            color: '#6366f1'
        }).setOrigin(1, 1);
        this.tweens.add({
            targets: this.continuarText,
            alpha: 0.25, yoyo: true, repeat: -1, duration: 750
        });

        // Configurar input
        const spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spacebar.on('down', () => this.avancar());
        this.input.on('pointerdown', () => this.avancar());

        // Exibir primeira fala com fade-in
        this.cameras.main.fadeIn(180);
        this.mostrarFala();
    }

    mostrarFala() {
        if (this.indexAtual < this.falas.length) {
            this.dialogoText.setText(this.falas[this.indexAtual]);
            this.counterText.setText(`${this.indexAtual + 1} / ${this.falas.length}`);
        }
    }

    avancar() {
        if (this._encerrado) return;
        this.indexAtual++;
        if (this.indexAtual < this.falas.length) {
            this.mostrarFala();
        } else {
            this.encerrar();
        }
    }

    encerrar() {
        if (this._encerrado) return;
        this._encerrado = true;

        this.cameras.main.fadeOut(280, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Emite evento de retorno para a MapaScene processar
            const mapaScene = this.scene.get('MapaScene');
            if (mapaScene) {
                mapaScene.events.emit('dialogoEncerrado', this.npcId);
            }
            this.scene.stop('DialogueScene');
            this.scene.resume('MapaScene');
        });
    }
}
