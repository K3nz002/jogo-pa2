/**
 * PuzzleScene — Cena overlay de puzzle de senha (computador).
 * Lançada sobre a MapaScene (que é pausada).
 *
 * Estrutura dos dados enviados via scene.launch(PuzzleScene, data):
 *   - puzzleId    {string} — ID do puzzle
 *   - pistasDados {object} — dados do puzzle vindos do pistas.json
 */
import { GameState } from '../utils/GameState.js';

export class PuzzleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PuzzleScene' });
    }

    init(data) {
        this.puzzleId = data.puzzleId || 'desconhecido';
        this.puzzleData = data.pistasDados || {};
        this.senhaCorreta = this.puzzleData.senha || '000000';
        this.maxDigitos = this.senhaCorreta.length;
        this.codigoAtual = '';
        this._resolvido = false;
    }

    create() {
        const { width, height } = this.scale;
        const panelW = 540, panelH = 600;
        const px = width / 2, py = height / 2;

        // Overlay de fundo
        this.add.rectangle(px, py, width, height, 0x000000, 0.88).setInteractive();

        // Painel do computador
        this.add.rectangle(px, py, panelW, panelH, 0x0b1120);
        this.add.rectangle(px, py, panelW, panelH, 0, 0).setStrokeStyle(2, 0x0e7490, 1);

        // Cabeçalho
        this.add.rectangle(px, py - panelH / 2 + 38, panelW, 76, 0x0d2031);
        this.add.text(px, py - panelH / 2 + 25, '💻  COMPUTADOR DE CARLOS', {
            fontSize: '18px', fontFamily: "'Courier New', monospace",
            color: '#06b6d4', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(px, py - panelH / 2 + 55, 'ACESSO RESTRITO — SENHA NECESSÁRIA', {
            fontSize: '12px', fontFamily: "'Courier New', monospace", color: '#164e63'
        }).setOrigin(0.5);

        // Dica (post-it)
        const dicaBg = this.add.rectangle(px, py - 155, panelW - 80, 80, 0x1c1410);
        dicaBg.setStrokeStyle(1, 0x78350f, 0.8);
        this.add.text(px, py - 175, '📝  Post-it no monitor:', {
            fontSize: '12px', fontFamily: "'Courier New', monospace", color: '#92400e'
        }).setOrigin(0.5);
        this.add.text(px, py - 150, this.puzzleData.dica || 'Digite a senha.', {
            fontSize: '13px', fontFamily: "'Courier New', monospace",
            color: '#fbbf24', wordWrap: { width: panelW - 100 }, align: 'center', lineSpacing: 4
        }).setOrigin(0.5);

        // Display da senha
        this.displayBg = this.add.rectangle(px, py - 55, 360, 58, 0x0d2031);
        this.displayBg.setStrokeStyle(2, 0x0e7490, 0.9);
        this.displayText = this.add.text(px, py - 55, this._gerarDisplay(), {
            fontSize: '30px', fontFamily: "'Courier New', monospace",
            color: '#06b6d4', letterSpacing: 12
        }).setOrigin(0.5);

        // Feedback de status
        this.statusText = this.add.text(px, py - 14, '', {
            fontSize: '14px', fontFamily: "'Courier New', monospace", color: '#94a3b8'
        }).setOrigin(0.5);

        // Teclado numérico (numpad 3x4)
        this._criarTecladoNumerico(px, py + 60);

        // Instruções
        this.add.text(px, py + panelH / 2 - 28, '[ ESC ]  Cancelar   •   Você também pode usar o teclado físico', {
            fontSize: '12px', fontFamily: "'Courier New', monospace", color: '#334155'
        }).setOrigin(0.5);

        // Input de teclado físico
        this.input.keyboard.on('keydown', (event) => {
            if (event.key >= '0' && event.key <= '9') this._pressionarDigito(event.key);
            if (event.key === 'Backspace') this._pressionarDigito('DEL');
            if (event.key === 'Enter') this._verificarSenha();
        });
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
            .on('down', () => this._cancelar());

        this.cameras.main.fadeIn(220);
    }

    _criarTecladoNumerico(cx, startY) {
        const digitos = ['1','2','3','4','5','6','7','8','9','DEL','0','OK'];
        const btnW = 76, btnH = 60, gapX = 10, gapY = 8;
        const cols = 3;

        digitos.forEach((d, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const bx = cx + (col - 1) * (btnW + gapX);
            const by = startY + row * (btnH + gapY);

            const cor = d === 'OK' ? 0x0e7490 : d === 'DEL' ? 0x450a0a : 0x1e293b;
            const corHover = d === 'OK' ? 0x155e75 : d === 'DEL' ? 0x7f1d1d : 0x334155;

            const btn = this.add.rectangle(bx, by, btnW, btnH, cor)
                .setInteractive({ useHandCursor: true });
            btn.setStrokeStyle(1, 0x475569, 0.6);

            this.add.text(bx, by, d, {
                fontSize: d === 'DEL' || d === 'OK' ? '14px' : '22px',
                fontFamily: "'Courier New', monospace",
                color: d === 'OK' ? '#06b6d4' : '#e2e8f0',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            btn.on('pointerover', () => btn.setFillStyle(corHover));
            btn.on('pointerout', () => btn.setFillStyle(cor));
            btn.on('pointerdown', () => {
                if (d === 'OK') this._verificarSenha();
                else this._pressionarDigito(d);
            });
        });
    }

    _gerarDisplay() {
        let s = '';
        for (let i = 0; i < this.maxDigitos; i++) {
            s += i < this.codigoAtual.length ? this.codigoAtual[i] : '_';
            if (i < this.maxDigitos - 1) s += ' ';
        }
        return s;
    }

    _pressionarDigito(d) {
        if (this._resolvido) return;
        if (d === 'DEL') {
            this.codigoAtual = this.codigoAtual.slice(0, -1);
        } else if (this.codigoAtual.length < this.maxDigitos) {
            this.codigoAtual += d;
        }
        this.displayText.setText(this._gerarDisplay());
        this.statusText.setText('');
        this.displayBg.setStrokeStyle(2, 0x0e7490, 0.9);
        this.displayText.setColor('#06b6d4');
    }

    _verificarSenha() {
        if (this._resolvido) return;
        if (this.codigoAtual === this.senhaCorreta) {
            this._acerto();
        } else {
            this._erro();
        }
    }

    _acerto() {
        this._resolvido = true;
        this.displayBg.setStrokeStyle(3, 0x22c55e, 1);
        this.displayText.setColor('#22c55e');
        this.statusText.setText('✓  ACESSO CONCEDIDO').setColor('#22c55e');

        this.time.delayedCall(1600, () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                const mapa = this.scene.get('MapaScene');
                if (mapa) {
                    mapa.events.emit('puzzleResolvido', {
                        puzzleId: this.puzzleId,
                        recompensaId: this.puzzleData.recompensa,
                        mensagem: `🔍 ${this.puzzleData.mensagemSucesso || 'Puzzle resolvido! Nova pista anotada no caderno.'}`
                    });
                }
                this.scene.stop('PuzzleScene');
                this.scene.resume('MapaScene');
            });
        });
    }

    _erro() {
        this.displayBg.setStrokeStyle(3, 0xef4444, 1);
        this.displayText.setColor('#ef4444');
        this.statusText.setText('✗  Senha incorreta. Tente novamente.').setColor('#ef4444');
        this.cameras.main.shake(280, 0.008);
        this.codigoAtual = '';

        this.time.delayedCall(700, () => {
            if (!this._resolvido) {
                this.displayBg.setStrokeStyle(2, 0x0e7490, 0.9);
                this.displayText.setColor('#06b6d4');
                this.statusText.setText('');
                this.displayText.setText(this._gerarDisplay());
            }
        });
    }

    _cancelar() {
        if (this._resolvido) return;
        this.cameras.main.fadeOut(220, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.stop('PuzzleScene');
            this.scene.resume('MapaScene');
        });
    }
}
