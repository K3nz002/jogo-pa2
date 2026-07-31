import { GameState } from '../utils/GameState.js';

const DIALOGO_CENA02 = [
    { ator: 'Policial', fala: 'Boa noite. Estou investigando o desaparecimento da Ana Vilanova.' },
    { ator: 'Amiga', fala: 'Não sei de nada, detetive! Ela deixou algumas coisas aqui antes de sumir...' },
    { ator: 'Policial', fala: 'Encontramos marcas e relatos de que ela estava sofrendo ameaças.' },
    { ator: 'Amiga', fala: 'Sim... ela parecia desesperada. A mochila dela ainda está ali no canto!' }
];

export default class Cena02 extends Phaser.Scene {
    constructor() {
        super({ key: 'Cena2Scene' });
    }

    create() {
        const { width, height } = this.scale;
    
        // Estados da cena
        this._fase = 'dialogo';
        this._dialogoIndex = 0;
        this._mochilaInvestigada = false;

        // Fundo básico
        this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a);

        // Personagem principal
        this.player = this.add.rectangle(120, height - 120, 40, 60, 0x6366f1);
        this.physics.add.existing(this.player);

        // ==========================================
        // 🎒 MOCHILA DA VÍTIMA (NOVO OBJETO)
        // ==========================================
        this._mochilaX = width / 2;
        this._mochilaY = height - 120;

        // Bloco/Ícone representativo da mochila
        this._mochilaObj = this.add.rectangle(this._mochilaX, this._mochilaY, 50, 50, 0x10b981);
        this._mochilaLabel = this.add.text(this._mochilaX, this._mochilaY - 45, '🎒 MOCHILA DA ANA', {
            fontSize: '13px',
            fontFamily: "'Courier New', monospace",
            color: '#10b981',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this._mochilaZona = this.add.zone(this._mochilaX, this._mochilaY, 70, 70);
        this.physics.add.existing(this._mochilaZona, true);

        // Efeito brilhante na mochila
        this.tweens.add({
            targets: [this._mochilaObj, this._mochilaLabel],
            alpha: 0.5,
            yoyo: true,
            repeat: -1,
            duration: 800
        });

        // Configuração da Porta de Saída (Inicialmente inativa)
        this._portaX = width - 80;
        this._portaY = height / 2;

        this._porta = this.add.rectangle(this._portaX, this._portaY, 60, 140, 0x1e293b);
        this._portaHighlight = this.add.rectangle(this._portaX, this._portaY, 66, 146).setStrokeStyle(2, 0x334155, 0.5);

        this._portaLabel = this.add.text(this._portaX, this._portaY - 90, 'SAÍDA', {
            fontSize: '14px',
            fontFamily: "'Courier New', monospace",
            color: '#64748b',
            fontStyle: 'bold'
        }).setOrigin(0.5);

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

        // Inicia o diálogo com a amiga
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

        this._roteiro = DIALOGO_CENA02.map(d => ({
            falante: d.ator === 'Policial' ? 'policial' : 'amiga',
            nome: d.ator === 'Policial' ? 'DETETIVE' : 'AMIGA',
            texto: d.fala,
            corNome: d.ator === 'Policial' ? 0x6366f1 : 0xa855f7,
            italico: d.ator === 'Amiga'
        }));

        this._dialogoGrupo = [];

        const overlay = this.add.rectangle(width / 2, (height - boxH) / 2, width, height - boxH, 0x000000, 0.45).setDepth(150);
        this._dialogoGrupo.push(overlay);

        const box = this.add.rectangle(width / 2, boxY, width - 30, boxH, 0x0b1120, 0.97).setDepth(150);
        box.setStrokeStyle(2, 0x6366f1, 0.9);
        this._dialogoGrupo.push(box);

        // Retrato Esquerdo (Detetive)
        this._retratoBoxEsq = this.add.rectangle(120, boxY, 130, 130, 0x1e3a5f).setDepth(151);
        this._dialogoGrupo.push(this._retratoBoxEsq);
        this._retratoEmojiEsq = this.add.text(120, boxY, '👮', { fontSize: '52px' }).setOrigin(0.5).setDepth(152);
        this._dialogoGrupo.push(this._retratoEmojiEsq);

        // Retrato Direito (Amiga)
        this._retratoBoxDir = this.add.rectangle(width - 120, boxY, 130, 130, 0x2d1a3a).setDepth(151);
        this._dialogoGrupo.push(this._retratoBoxDir);
        this._retratoEmojiDir = this.add.text(width - 120, boxY, '😢', { fontSize: '52px' }).setOrigin(0.5).setDepth(152);
        this._dialogoGrupo.push(this._retratoEmojiDir);

        this._dialogoText = this.add.text(220, boxY - 60, '', {
            fontSize: '18px', fontFamily: "'Courier New', monospace",
            color: '#e2e8f0', wordWrap: { width: width - 380 }, lineSpacing: 8
        }).setOrigin(0, 0).setDepth(153);
        this._dialogoGrupo.push(this._dialogoText);

        this._continuarText = this.add.text(width / 2, boxY + boxH / 2 - 22, '▶ CLIQUE / ESPAÇO PARA AVANÇAR', {
            fontSize: '13px', fontFamily: "'Courier New', monospace", color: '#6366f1'
        }).setOrigin(0.5, 1).setDepth(153);
        this._dialogoGrupo.push(this._continuarText);

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
        this._typewriterText(fala.texto);
    }

    _typewriterText(fullText) {
        this._dialogoText.setText('');
        this._twChars = fullText ? fullText.split('') : [];
        this._twIndex = 0;
        this._twTarget = fullText || '';

        if (this._twTimer) this._twTimer.remove();

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
        this._fase = 'exploracao_mochila';

        if (this._dialogoClickHandler) {
            this.input.off('pointerdown', this._dialogoClickHandler);
        }

        this.tweens.add({
            targets: this._dialogoGrupo,
            alpha: 0, duration: 400,
            onComplete: () => {
                this._dialogoGrupo.forEach(obj => obj.destroy());
                this._dialogoGrupo = [];
                this._liberarInteracaoMochila();
            }
        });
    }

    // =======================================================
    // 🔍 INTERAÇÃO COM A MOCHILA E LEITURA DO BILHETE
    // =======================================================

    _liberarInteracaoMochila() {
        if (this._instrBg && this._instrText) {
            this._instrBg.setVisible(true).setAlpha(1);
            this._instrText.setVisible(true).setAlpha(1);
            this._instrText.setText('Examine a mochila verde da vítima no centro da sala');
            this._instrText.setColor('#10b981');
        }

        // Permite clicar na mochila
        this._mochilaObj.setInteractive({ useHandCursor: true });
        this._mochilaObj.on('pointerdown', () => this._abrirBilhete());

        // Ou andar até ela
        this.physics.add.overlap(this.player, this._mochilaZona, () => this._abrirBilhete());
    }

    _abrirBilhete() {
        if (this._mochilaInvestigada || this._fase === 'lendo_bilhete') return;
        this._fase = 'lendo_bilhete';

        const { width, height } = this.scale;
        this._bilheteGrupo = [];

        // Fundo escuro
        const bgOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75).setDepth(250);
        this._bilheteGrupo.push(bgOverlay);

        // Papel do bilhete
        const papel = this.add.rectangle(width / 2, height / 2, 550, 350, 0xfef3c7).setDepth(251);
        papel.setStrokeStyle(3, 0xd97706);
        this._bilheteGrupo.push(papel);

        // Título do Bilhete
        const titulo = this.add.text(width / 2, height / 2 - 130, '📜 BILHETE ENCONTRADO NA MOCHILA', {
            fontSize: '16px', fontFamily: "'Courier New', monospace", color: '#b45309', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(252);
        this._bilheteGrupo.push(titulo);

        // Texto de Desabafo da Vítima
        const textoBilhete = 
            '"Não aguento mais a pressão e as ameaças... Preciso sair da cidade.\n' +
            'Vou me encontrar com alguém na lanchonete hoje à noite para tentar\n' +
            'resolver isso de uma vez por todas. Se algo me acontecer,\n' +
            'procurem por quem estava me seguindo."';

        const conteudo = this.add.text(width / 2, height / 2 - 20, textoBilhete, {
            fontSize: '15px', fontFamily: "'Courier New', monospace", color: '#1e293b',
            align: 'center', lineSpacing: 10, fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(252);
        this._bilheteGrupo.push(conteudo);

        // Botão Fechar / Guardar Pista
        const btnGuardar = this.add.rectangle(width / 2, height / 2 + 120, 200, 45, 0xd97706).setDepth(252);
        btnGuardar.setInteractive({ useHandCursor: true });
        this._bilheteGrupo.push(btnGuardar);

        const btnText = this.add.text(width / 2, height / 2 + 120, 'GUARDAR PISTA', {
            fontSize: '15px', fontFamily: "'Courier New', monospace", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(253);
        this._bilheteGrupo.push(btnText);

        btnGuardar.on('pointerdown', () => this._fecharBilhete());
    }

    _fecharBilhete() {
        this._mochilaInvestigada = true;

        // Salva as informações da pista no GameState
        GameState.anotarPista('bilhete_desabafo_vitima');
        GameState.registrarAnotacaoInterrogatorio(
            'amiga', 'Mochila da Ana', GameState.diaAtual,
            'Bilhete de desabafo encontrado: Ana relatou ameaças e um encontro marcado na lanchonete.'
        );

        // Destrói a tela do bilhete
        this._bilheteGrupo.forEach(o => o.destroy());
        this._bilheteGrupo = [];

        // Exibe o popup oficial da nova missão
        this._mostrarPopupMissao();
    }

    // =======================================================
    // MÉTODOS DO POPUP DE MISSÃO
    // =======================================================

    _mostrarPopupMissao() {
        this._fase = 'missao';
        const { width, height } = this.scale;

        this._missaoOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setDepth(200);

        const popW = 620;
        const popH = 340;
        const cx = width / 2;
        const cy = height / 2;

        this._missaoGrupo = [];

        const popBg = this.add.rectangle(cx, cy, popW, popH, 0x0b1120, 0.98).setDepth(201);
        popBg.setStrokeStyle(2, 0x6366f1, 0.9);
        this._missaoGrupo.push(popBg);

        const icone = this.add.text(cx, cy - 110, '📋', { fontSize: '42px' }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(icone);

        const titulo = this.add.text(cx, cy - 55, 'NOVO OBJETIVO', {
            fontSize: '24px', fontFamily: "'Courier New', monospace", color: '#f8fafc', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(titulo);

        const objetivo = this.add.text(cx, cy + 5, '📌  Investigar a Lanchonete', {
            fontSize: '18px', fontFamily: "'Courier New', monospace", color: '#fbbf24', align: 'center'
        }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(objetivo);

        const pista = this.add.text(cx, cy + 45, '🔍 Pista Adquirida: Bilhete revelando o\nencontro secreto na lanchonete!', {
            fontSize: '14px', fontFamily: "'Courier New', monospace", color: '#94a3b8', align: 'center'
        }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(pista);

        const btnBg = this.add.rectangle(cx, cy + 120, 220, 55, 0x6366f1).setDepth(203);
        btnBg.setInteractive({ useHandCursor: true });
        this._missaoGrupo.push(btnBg);

        const btnText = this.add.text(cx, cy + 120, '▶  IR PARA MAPA', {
            fontSize: '18px', fontFamily: "'Courier New', monospace", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(204);
        this._missaoGrupo.push(btnText);

        btnBg.on('pointerdown', () => this._aoClicarVamos());
    }

    _aoClicarVamos() {
        if (this._fase !== 'missao') return;
        this._missaoGrupo.forEach(o => o.destroy());
        if (this._missaoOverlay) this._missaoOverlay.destroy();

        this._ativarPortaSaida();
    }

    // =======================================================
    // MÉTODOS DE SAÍDA E TRANSIÇÃO
    // =======================================================

    _ativarPortaSaida() {
        this._fase = 'saida';

        if (this._portaHighlight) {
            this._portaHighlight.setStrokeStyle(3, 0xfbbf24, 0.8);
        }

        if (this._portaLabel) {
            this._portaLabel.setAlpha(1);
            this._portaLabel.setColor('#fbbf24');
        }

        if (this._instrBg && this._instrText) {
            this._instrBg.setVisible(true);
            this._instrText.setText('Dirija-se à porta de saída para ir ao Mapa');
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

        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MapaScene');
        });
    }
}
