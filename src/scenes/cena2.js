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
        this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a).setDepth(0);

        // ==========================================
        // 🕵️ PERSONAGEM PRINCIPAL (Com visibilidade e física)
        // ==========================================
        this.player = this.add.rectangle(120, height - 120, 40, 60, 0x6366f1);
        this.player.setStrokeStyle(2, 0xffffff); // Borda branca para destacar no escuro
        this.player.setDepth(20);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        this.playerLabel = this.add.text(120, height - 160, '🕵️ DETETIVE', {
            fontSize: '12px', fontFamily: "'Courier New', monospace", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20);

        // Controles do Teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // ==========================================
        // 🎒 MOCHILA DA VÍTIMA
        // ==========================================
        this._mochilaX = width / 2;
        this._mochilaY = height - 120;

        this._mochilaObj = this.add.rectangle(this._mochilaX, this._mochilaY, 50, 50, 0x10b981).setDepth(10);
        this._mochilaObj.setStrokeStyle(2, 0xa7f3d0);

        this._mochilaLabel = this.add.text(this._mochilaX, this._mochilaY - 45, '🎒 MOCHILA DA ANA', {
            fontSize: '13px', fontFamily: "'Courier New', monospace", color: '#10b981', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);

        this.tweens.add({
            targets: [this._mochilaObj, this._mochilaLabel],
            alpha: 0.5, yoyo: true, repeat: -1, duration: 800
        });

        // ==========================================
        // 🚪 PORTA DE SAÍDA
        // ==========================================
        this._portaX = width - 80;
        this._portaY = height - 120;

        this._porta = this.add.rectangle(this._portaX, this._portaY, 60, 120, 0x1e293b).setDepth(10);
        this._portaHighlight = this.add.rectangle(this._portaX, this._portaY, 66, 126).setStrokeStyle(2, 0x334155, 0.5).setDepth(10);

        this._portaLabel = this.add.text(this._portaX, this._portaY - 80, 'SAÍDA', {
            fontSize: '14px', fontFamily: "'Courier New', monospace", color: '#64748b', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);

        // Caixa de instruções no topo
        this._instrBg = this.add.rectangle(width / 2, 40, width - 100, 40, 0x0b1120, 0.9).setVisible(false).setDepth(100);
        this._instrBg.setStrokeStyle(1, 0x334155);

        this._instrText = this.add.text(width / 2, 40, '', {
            fontSize: '14px', fontFamily: "'Courier New', monospace", color: '#ffffff'
        }).setOrigin(0.5).setVisible(false).setDepth(101);

        // Inicia com o diálogo
        this._criarDialogo();
    }

    update() {
        // Acompanha a posição do texto do nome do detetive
        if (this.player && this.playerLabel) {
            this.playerLabel.setPosition(this.player.x, this.player.y - 45);
        }

        // 🚶 LÓGICA DE MOVIMENTAÇÃO DO PERSONAGEM
        if (this._fase === 'exploracao_mochila' || this._fase === 'saida') {
            const speed = 220;
            this.player.body.setVelocity(0);

            // Controles de direção (Setas ou WASD)
            if (this.cursors.left.isDown || this.wasd.left.isDown) {
                this.player.body.setVelocityX(-speed);
            } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
                this.player.body.setVelocityX(speed);
            }

            if (this.cursors.up.isDown || this.wasd.up.isDown) {
                this.player.body.setVelocityY(-speed);
            } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
                this.player.body.setVelocityY(speed);
            }

            // Checa aproximação da mochila
            if (this._fase === 'exploracao_mochila') {
                const distMochila = Phaser.Math.Distance.Between(this.player.x, this.player.y, this._mochilaX, this._mochilaY);
                
                if (distMochila < 70) {
                    this._instrText.setText('Aperte [ESPAÇO] ou [E] para examinar a mochila');
                    this._instrText.setColor('#10b981');

                    if (Phaser.Input.Keyboard.JustDown(this.keyE) || Phaser.Input.Keyboard.JustDown(this.keySpace)) {
                        this._abrirBilhete();
                    }
                } else {
                    this._instrText.setText('Ande até a mochila verde com as SETAS / WASD');
                    this._instrText.setColor('#ffffff');
                }
            }

            // Checa aproximação da porta
            if (this._fase === 'saida') {
                const distPorta = Phaser.Math.Distance.Between(this.player.x, this.player.y, this._portaX, this._portaY);
                
                if (distPorta < 70) {
                    this._instrText.setText('Aperte [ESPAÇO] ou [E] para ir ao Mapa');
                    this._instrText.setColor('#fbbf24');

                    if (Phaser.Input.Keyboard.JustDown(this.keyE) || Phaser.Input.Keyboard.JustDown(this.keySpace)) {
                        this._sairCasa();
                    }
                } else {
                    this._instrText.setText('Ande até a porta de saída');
                    this._instrText.setColor('#fbbf24');
                }
            }
        }
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
            texto: d.fala
        }));

        this._dialogoGrupo = [];

        const overlay = this.add.rectangle(width / 2, (height - boxH) / 2, width, height - boxH, 0x000000, 0.45).setDepth(150);
        this._dialogoGrupo.push(overlay);

        const box = this.add.rectangle(width / 2, boxY, width - 30, boxH, 0x0b1120, 0.97).setDepth(150);
        box.setStrokeStyle(2, 0x6366f1, 0.9);
        this._dialogoGrupo.push(box);

        this._retratoBoxEsq = this.add.rectangle(120, boxY, 130, 130, 0x1e3a5f).setDepth(151);
        this._dialogoGrupo.push(this._retratoBoxEsq);
        this._retratoEmojiEsq = this.add.text(120, boxY, '👮', { fontSize: '52px' }).setOrigin(0.5).setDepth(152);
        this._dialogoGrupo.push(this._retratoEmojiEsq);

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
        }

        this._mochilaObj.setInteractive({ useHandCursor: true });
        this._mochilaObj.on('pointerdown', () => this._abrirBilhete());
    }

    _abrirBilhete() {
        if (this._mochilaInvestigada || this._fase === 'lendo_bilhete') return;
        this._fase = 'lendo_bilhete';

        if (this.player && this.player.body) this.player.body.setVelocity(0);

        const { width, height } = this.scale;
        this._bilheteGrupo = [];

        const bgOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75).setDepth(250);
        this._bilheteGrupo.push(bgOverlay);

        const papel = this.add.rectangle(width / 2, height / 2, 600, 380, 0xfef3c7).setDepth(251);
        papel.setStrokeStyle(3, 0xd97706);
        this._bilheteGrupo.push(papel);

        const titulo = this.add.text(width / 2, height / 2 - 140, '📜 BILHETE ENCONTRADO NA MOCHILA', {
            fontSize: '16px', fontFamily: "'Courier New', monospace", color: '#b45309', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(252);
        this._bilheteGrupo.push(titulo);

        const textoBilhete = 
            '"Não agumento mais a pressão e as ameaças... Preciso sair da cidade.\n\n' +
            'Vou me encontrar com alguém na lanchonete hoje à noite para tentar ' +
            'resolver isso de uma vez por todas. Se algo me acontecer, ' +
            'procurem por quem estava me seguindo."';

        // WordWrap garante que o texto não vaze a folha amarela
        const conteudo = this.add.text(width / 2, height / 2 - 10, textoBilhete, {
            fontSize: '15px',
            fontFamily: "'Courier New', monospace",
            color: '#1e293b',
            align: 'center',
            lineSpacing: 8,
            fontStyle: 'italic',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setDepth(252);
        this._bilheteGrupo.push(conteudo);

        const btnGuardar = this.add.rectangle(width / 2, height / 2 + 130, 220, 45, 0xd97706).setDepth(252);
        btnGuardar.setInteractive({ useHandCursor: true });
        this._bilheteGrupo.push(btnGuardar);

        const btnText = this.add.text(width / 2, height / 2 + 130, 'GUARDAR PISTA', {
            fontSize: '15px', fontFamily: "'Courier New', monospace", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(253);
        this._bilheteGrupo.push(btnText);

        btnGuardar.on('pointerdown', () => this._fecharBilhete());
    }

    _fecharBilhete() {
        this._mochilaInvestigada = true;

        GameState.anotarPista('bilhete_desabafo_vitima');
        GameState.registrarAnotacaoInterrogatorio(
            'amiga', 'Mochila da Ana', GameState.diaAtual,
            'Bilhete de desabafo encontrado: Ana relatou ameaças e um encontro marcado na lanchonete.'
        );

        this._bilheteGrupo.forEach(o => o.destroy());
        this._bilheteGrupo = [];

        this._mostrarPopupMissao();
    }

    // =======================================================
    // POPUP DE MISSÃO E SAÍDA
    // =======================================================

    _mostrarPopupMissao() {
        this._fase = 'missao';
        const { width, height } = this.scale;

        this._missaoOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setDepth(200);

        const cx = width / 2;
        const cy = height / 2;
        this._missaoGrupo = [];

        const popBg = this.add.rectangle(cx, cy, 620, 340, 0x0b1120, 0.98).setDepth(201);
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

        const btnText = this.add.text(cx, cy + 120, '▶  CONTINUAR', {
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

    _ativarPortaSaida() {
        this._fase = 'saida';

        if (this._portaHighlight) {
            this._portaHighlight.setStrokeStyle(3, 0xfbbf24, 0.8);
        }

        if (this._portaLabel) {
            this._portaLabel.setAlpha(1);
            this._portaLabel.setColor('#fbbf24');
        }

        if (this._porta) {
            this._porta.setInteractive({ useHandCursor: true });
            this._porta.on('pointerdown', () => this._sairCasa());
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
