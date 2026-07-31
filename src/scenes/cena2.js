//import Phaser from 'phaser';
import GameState from '../GameState.js';
import { DIALOGO_CENA02 } from '../dialogos.js';

export default class Cena02 extends Phaser.Scene {
    constructor() {
        super({ key: 'Cena02' });
    }

    create() {
        const { width, height } = this.scale;

        // Estado inicial da cena
        this._fase = 'dialogo';
        this._dialogoIndex = 0;

        // Fundo básico da cena
        this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a);

        // Personagem principal
        this.player = this.add.rectangle(120, height - 120, 40, 60, 0x6366f1);
        this.physics.add.existing(this.player);

        // Configuração da Porta de Saída
        this._portaX = width - 80;
        this._portaY = height / 2;

        this._porta = this.add.rectangle(this._portaX, this._portaY, 60, 140, 0x1e293b);
        this._portaHighlight = this.add.rectangle(this._portaX, this._portaY, 66, 146).setStrokeStyle(2, 0x6366f1, 0);

        this._portaLabel = this.add.text(this._portaX, this._portaY - 90, 'SAÍDA', {
            fontSize: '14px',
            fontFamily: "'Courier New', monospace",
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);

        this._portaZona = this.add.zone(this._portaX, this._portaY, 80, 140);
        this.physics.add.existing(this._portaZona, true);

        // Caixa de instruções da tela (topo)
        this._instrBg = this.add.rectangle(width / 2, 40, width - 100, 40, 0x0b1120, 0.9).setVisible(false);
        this._instrBg.setStrokeStyle(1, 0x334155);

        this._instrText = this.add.text(width / 2, 40, '', {
            fontSize: '14px',
            fontFamily: "'Courier New', monospace",
            color: '#ffffff'
        }).setOrigin(0.5).setVisible(false);

        // Inicia a sequência de diálogo
        this._criarDialogo();
    }

    update() {
        // Lógica de atualização se necessária
    }

    // =======================================================
    // MÉTODOS DO DIÁLOGO
    // =======================================================

    _criarDialogo() {
        const { width, height } = this.scale;
        const boxH = 250;
        const boxY = height - boxH / 2 - 10;

        this._dialogoIndex = 0;
        this._fase = 'dialogo';

        // Roteiro formatado
        this._roteiro = DIALOGO_CENA02.map(d => ({
            falante: d.ator === 'Policial' ? 'policial' : 'amiga',
            nome: d.ator === 'Policial' ? 'DETETIVE' : 'AMIGA',
            texto: d.fala,
            corNome: d.ator === 'Policial' ? 0x6366f1 : 0xa855f7,
            retrato: d.ator === 'Policial' ? '👮' : '😢',
            retratoBg: d.ator === 'Policial' ? 0x1e3a5f : 0x2d1a3a,
            italico: d.ator === 'Amiga'
        }));

        this._dialogoGrupo = [];

        // Overlay escurecido
        const overlay = this.add.rectangle(width / 2, (height - boxH) / 2, width, height - boxH, 0x000000, 0.45).setDepth(150);
        this._dialogoGrupo.push(overlay);

        // Caixa de diálogo
        const box = this.add.rectangle(width / 2, boxY, width - 30, boxH, 0x0b1120, 0.97).setDepth(150);
        box.setStrokeStyle(2, 0x6366f1, 0.9);
        this._dialogoGrupo.push(box);

        // Retrato Esquerdo (Detetive)
        this._retratoBoxEsq = this.add.rectangle(120, boxY, 130, 130, 0x1e3a5f).setDepth(151);
        this._retratoBoxEsq.setStrokeStyle(2, 0x6366f1, 0.8);
        this._dialogoGrupo.push(this._retratoBoxEsq);

        this._retratoEmojiEsq = this.add.text(120, boxY, '👮', { fontSize: '52px' }).setOrigin(0.5).setDepth(152);
        this._dialogoGrupo.push(this._retratoEmojiEsq);

        this._nomeBadgeEsqBg = this.add.rectangle(120, boxY - 82, 150, 32, 0x6366f1).setDepth(153);
        this._dialogoGrupo.push(this._nomeBadgeEsqBg);

        this._nomeTextEsq = this.add.text(120, boxY - 82, 'DETETIVE', {
            fontSize: '13px', fontFamily: "'Courier New', monospace",
            color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(154);
        this._dialogoGrupo.push(this._nomeTextEsq);

        // Retrato Direito (Amiga)
        this._retratoBoxDir = this.add.rectangle(width - 120, boxY, 130, 130, 0x2d1a3a).setDepth(151);
        this._retratoBoxDir.setStrokeStyle(2, 0xa855f7, 0.8);
        this._dialogoGrupo.push(this._retratoBoxDir);

        this._retratoEmojiDir = this.add.text(width - 120, boxY, '😢', { fontSize: '52px' }).setOrigin(0.5).setDepth(152);
        this._dialogoGrupo.push(this._retratoEmojiDir);

        this._nomeBadgeDirBg = this.add.rectangle(width - 120, boxY - 82, 150, 32, 0xa855f7).setDepth(153);
        this._dialogoGrupo.push(this._nomeBadgeDirBg);

        this._nomeTextDir = this.add.text(width - 120, boxY - 82, 'AMIGA', {
            fontSize: '13px', fontFamily: "'Courier New', monospace",
            color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(154);
        this._dialogoGrupo.push(this._nomeTextDir);

        // Texto principal
        this._dialogoText = this.add.text(220, boxY - 60, '', {
            fontSize: '18px', fontFamily: "'Courier New', monospace",
            color: '#e2e8f0', wordWrap: { width: width - 380 }, lineSpacing: 8
        }).setOrigin(0, 0).setDepth(153);
        this._dialogoGrupo.push(this._dialogoText);

        // Contador
        this._contadorText = this.add.text(width - 180, boxY - boxH / 2 + 18, '', {
            fontSize: '13px', fontFamily: "'Courier New', monospace", color: '#475569'
        }).setOrigin(1, 0.5).setDepth(153);
        this._dialogoGrupo.push(this._contadorText);

        // Botão Continuar
        this._continuarText = this.add.text(width / 2, boxY + boxH / 2 - 22, '▶  CLIQUE  /  ESPAÇO', {
            fontSize: '13px', fontFamily: "'Courier New', monospace", color: '#6366f1'
        }).setOrigin(0.5, 1).setDepth(153);

        this.tweens.add({
            targets: this._continuarText,
            alpha: 0.25, yoyo: true, repeat: -1, duration: 750
        });
        this._dialogoGrupo.push(this._continuarText);

        // Handler de clique
        this._dialogoClickHandler = () => {
            if (this._fase === 'dialogo') this._avancarDialogo();
        };
        this.input.on('pointerdown', this._dialogoClickHandler);

        this._mostrarFala();
    }

    _mostrarFala() {
        if (this._dialogoIndex >= this._roteiro.length) {
            this._encerrarDialogo();
            return;
        }

        const fala = this._roteiro[this._dialogoIndex];
        const isPolicial = fala.falante === 'policial';

        const alphaEsq = isPolicial ? 1 : 0.4;
        this._retratoBoxEsq.setAlpha(alphaEsq);
        this._retratoEmojiEsq.setAlpha(alphaEsq);
        this._nomeBadgeEsqBg.setAlpha(alphaEsq);
        this._nomeTextEsq.setAlpha(alphaEsq);

        const alphaDir = isPolicial ? 0.4 : 1;
        this._retratoBoxDir.setAlpha(alphaDir);
        this._retratoEmojiDir.setAlpha(alphaDir);
        this._nomeBadgeDirBg.setAlpha(alphaDir);
        this._nomeTextDir.setAlpha(alphaDir);

        if (fala.italico) {
            this._dialogoText.setColor('#c4b5fd');
            this._dialogoText.setFontStyle('italic');
        } else {
            this._dialogoText.setColor('#e2e8f0');
            this._dialogoText.setFontStyle('normal');
        }

        this._typewriterText(fala.texto);
        this._contadorText.setText(`${this._dialogoIndex + 1} / ${this._roteiro.length}`);
    }

    _typewriterText(fullText) {
        this._dialogoText.setText('');
        this._twChars = fullText ? fullText.split('') : [];
        this._twIndex = 0;
        this._twTarget = fullText || '';

        if (this._twTimer) this._twTimer.remove();
        if (this._twChars.length === 0) return;

        this._twTimer = this.time.addEvent({
            delay: 28,
            repeat: this._twChars.length - 1,
            callback: () => {
                this._twIndex++;
                this._dialogoText.setText(this._twTarget.substring(0, this._twIndex));
            }
        });
    }

    _avancarDialogo() {
        if (this._twChars && this._twIndex < this._twChars.length) {
            if (this._twTimer) this._twTimer.remove();
            this._dialogoText.setText(this._twTarget);
            this._twIndex = this._twChars.length;
            return;
        }

        this._dialogoIndex++;
        this._mostrarFala();
    }

    _encerrarDialogo() {
        this._dialogoConcluido = true;
        this._fase = 'encerrando_dialogo';

        if (this._dialogoClickHandler) {
            this.input.off('pointerdown', this._dialogoClickHandler);
        }

        this.tweens.add({
            targets: this._dialogoGrupo,
            alpha: 0, duration: 400,
            onComplete: () => {
                this._dialogoGrupo.forEach(obj => obj.destroy());
                this._dialogoGrupo = [];

                GameState.anotarPista('relato_violencia_psicologica');
                GameState.registrarAnotacaoInterrogatorio(
                    'amiga', 'Amiga da Vítima', GameState.diaAtual,
                    'Relato de violência psicológica pelo parceiro. Vítima saiu correndo após briga. Próximo destino: lanchonete.'
                );

                this.time.delayedCall(400, () => this._mostrarPopupMissao());
            }
        });
    }

    // =======================================================
    // MÉTODOS DO POPUP DE MISSÃO
    // =======================================================

    _mostrarPopupMissao() {
        this._fase = 'missao';
        const { width, height } = this.scale;

        this._missaoOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setDepth(200);
        this._missaoOverlay.setAlpha(0);

        const popW = 620;
        const popH = 340;
        const cx = width / 2;
        const cy = height / 2;

        this._missaoGrupo = [];

        const popBg = this.add.rectangle(cx, cy, popW, popH, 0x0b1120, 0.98).setDepth(201);
        popBg.setStrokeStyle(2, 0x6366f1, 0.9);
        this._missaoGrupo.push(popBg);

        const linhaTop = this.add.rectangle(cx, cy - popH / 2 + 50, popW - 40, 2, 0x6366f1, 0.4).setDepth(202);
        this._missaoGrupo.push(linhaTop);

        const icone = this.add.text(cx, cy - 110, '📋', { fontSize: '42px' }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(icone);

        const titulo = this.add.text(cx, cy - 55, 'NOVO OBJETIVO', {
            fontSize: '24px', fontFamily: "'Courier New', monospace",
            color: '#f8fafc', fontStyle: 'bold', letterSpacing: 3
        }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(titulo);

        const sep = this.add.rectangle(cx, cy - 25, 200, 1, 0x334155).setDepth(202);
        this._missaoGrupo.push(sep);

        const objetivo = this.add.text(cx, cy + 5, '📌  Investigar a lanchonete', {
            fontSize: '18px', fontFamily: "'Courier New', monospace",
            color: '#fbbf24', align: 'center'
        }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(objetivo);

        const pista = this.add.text(cx, cy + 45, '🔍  Pista Nova: Relato de violência\npsicológica e bilhete suspeito', {
            fontSize: '14px', fontFamily: "'Courier New', monospace",
            color: '#94a3b8', align: 'center', lineSpacing: 5
        }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(pista);

        const btnBg = this.add.rectangle(cx, cy + 120, 220, 55, 0x6366f1).setDepth(203);
        btnBg.setInteractive({ useHandCursor: true });
        this._missaoGrupo.push(btnBg);

        const btnText = this.add.text(cx, cy + 120, '▶  VAMOS', {
            fontSize: '20px', fontFamily: "'Courier New', monospace",
            color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(204);
        btnText.setInteractive({ useHandCursor: true });
        this._missaoGrupo.push(btnText);

        this.tweens.add({
            targets: btnText, alpha: 0.65, yoyo: true, repeat: -1,
            duration: 1000, ease: 'Sine.easeInOut', delay: 600
        });

        btnBg.on('pointerover', () => {
            this.tweens.add({ targets: [btnBg, btnText], scaleX: 1.05, scaleY: 1.05, duration: 120 });
            btnBg.setFillStyle(0x4f46e5);
        });
        btnBg.on('pointerout', () => {
            this.tweens.add({ targets: [btnBg, btnText], scaleX: 1, scaleY: 1, duration: 120 });
            btnBg.setFillStyle(0x6366f1);
        });

        btnBg.on('pointerdown', () => this._aoClicarVamos());
        btnText.on('pointerdown', () => this._aoClicarVamos());

        this._missaoGrupo.forEach(o => o.setAlpha(0));
        this.tweens.add({ targets: this._missaoOverlay, alpha: 1, duration: 400 });
        this.tweens.add({ targets: this._missaoGrupo, alpha: 1, duration: 500, delay: 200, ease: 'Power2' });
    }

    _aoClicarVamos() {
        if (this._fase !== 'missao') return;
        this._fase = 'saindo_missao';

        this._missaoGrupo.forEach(o => {
            this.tweens.killTweensOf(o);
            if (o.input) o.disableInteractive();
        });
        if (this._missaoOverlay) this.tweens.killTweensOf(this._missaoOverlay);

        this._missaoGrupo.forEach(o => o.destroy());
        this._missaoGrupo = [];
        if (this._missaoOverlay) {
            this._missaoOverlay.destroy();
            this._missaoOverlay = null;
        }

        this._ativarPortaSaida();
    }

    // =======================================================
    // MÉTODOS DE SAÍDA E TRANSIÇÃO
    // =======================================================

    _ativarPortaSaida() {
        this._fase = 'saida';

        if (this._portaHighlight) {
            this._portaHighlight.setStrokeStyle(3, 0xfbbf24, 0.8);
            this.tweens.add({
                targets: this._portaHighlight,
                alpha: 0.9, yoyo: true, repeat: -1, duration: 800, ease: 'Sine.easeInOut'
            });
        }

        this._portaSeta = this.add.text(this._portaX, this._portaY - 90, '▼', {
            fontSize: '28px', fontFamily: "'Courier New', monospace",
            color: '#fbbf24', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
            targets: this._portaSeta,
            y: this._portaY - 75,
            yoyo: true, repeat: -1, duration: 600, ease: 'Sine.easeInOut'
        });

        if (this._portaLabel) {
            this._portaLabel.setAlpha(1);
            this._portaLabel.setColor('#fbbf24');
        }

        if (this._instrBg && this._instrText) {
            this._instrBg.setVisible(true).setAlpha(1);
            this._instrText.setVisible(true).setAlpha(1);
            this._instrText.setText('Dirija-se à porta de saída para investigar a lanchonete');
            this._instrText.setColor('#fbbf24');
        }

        if (this._porta) {
            this._porta.setInteractive({ useHandCursor: true });
            this._porta.on('pointerdown', () => this._sairCasa());
        }

        if (this.player && this._portaZona) {
            this.physics.add.overlap(this.player, this._portaZona, () => this._sairCasa());
        }
    }

    _sairCasa() {
        if (this._fase !== 'saida') return;
        this._fase = 'transicao';

        GameState.flags.fase_02_concluida = true;
        GameState.flags.objetivo_atual = 'investigar_lanchonete';
        GameState.flags.cenario_03_desbloqueado = true;

        this.cameras.main.fadeOut(1200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MapaScene');
        });
    }
}
