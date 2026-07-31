/**
 * Cena3Scene — Cena 03: Lanchonete (Local de Trabalho da Vítima)
 *
 * O jogador investiga o ambiente de trabalho da vítima, analisa as gravações
 * das câmeras de segurança (prova crucial) e colhe o depoimento do gerente.
 * Ao concluir, libera a transição para a fase final de Julgamento / Confronto.
 */
import { GameState } from '../utils/GameState.js';

const DIALOGO_CENA03 = [
    { falante: 'policial', texto: 'Boa noite. Sou o detetive responsável pelo caso. A vítima trabalhava aqui, correto?' },
    { falante: 'gerente', texto: 'Sim, ela é nossa atendente. Estamos todos desesperados sem notícias dela!' },
    { falante: 'policial', texto: 'Verifiquei o sistema de câmeras de segurança do balcão. Você notou algo estranho na última noite?' },
    { falante: 'gerente', texto: 'O ex-parceiro dela apareceu aqui alterado, fazendo ameaças e tentando forçá-la a ir embora. Nós ameaçamos chamar a polícia e ele fugiu.' },
    { falante: 'policial', texto: 'Consegui isolar o trecho das gravações da câmera. A gravação mostra claramente a abordagem agressiva dele.' },
    { falante: 'gerente', texto: 'Isso é terrível! Por favor, use essas imagens para prender esse sujeito antes que algo pior aconteça.' },
    { falante: 'policial', texto: 'Com essas gravações e o histórico de mensagens, temos provas irrefutáveis. Estou emitindo o mandado de prisão imediato.' }
];

const TEXTO_EVIDENCIA = "Você acessou o computador do balcão e recuperou as gravações do circuito interno de TV (CFTV). O vídeo mostra o suspeito intimidando e perseguindo a vítima no local de trabalho.";
const TEXTO_BLOQUEIO = "Examine o sistema de câmeras de segurança no balcão antes de interrogar o gerente.";

export class Cena3Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Cena3Scene' });
    }

    init() {
        this.velocidadePlayer = 260;
        this._fase = 'exploracao';   // 'exploracao' | 'popup_evidencia' | 'dialogo' | 'encerrando_dialogo' | 'missao' | 'saindo_missao' | 'saida' | 'transicao'
        this._evidenciaEncontrada = false;
        this._dialogoConcluido = false;
        this._dialogoIndex = 0;
        this._dialogoGrupo = [];
        this._missaoGrupo = [];
    }

    create() {
        const { width, height } = this.scale;

        // Construção do ambiente interno da Lanchonete
        this._criarAmbiente(width, height);
        this._criarMobilia(width, height);
        this._criarNPCGerente(width, height);
        this._criarPontoEvidencia(width, height);
        this._criarPortaSaida(width, height);
        this._criarPlayer(width, height);
        this._criarUIInstrucao(width, height);
        this._configurarControles();

        // Fade in de entrada
        this.cameras.main.fadeIn(800, 0, 0, 0);
    }

    update() {
        if (this._fase !== 'exploracao' && this._fase !== 'saida') {
            this.player.body.setVelocity(0);
            return;
        }

        this._processarMovimento();

        if (this._playerIcon) {
            this._playerIcon.setPosition(this.player.x, this.player.y - 28);
        }
    }

    _criarAmbiente(w, h) {
        // Piso da lanchonete (tom quente/pizzaria/diner)
        this.add.rectangle(w / 2, h / 2, w, h, 0x451a03);
        this.add.grid(w / 2, h / 2, w, h, 64, 64, 0x78350f, 0.4, 0x451a03, 0.8);

        // Parede do fundo
        this.add.rectangle(w / 2, 70, w, 140, 0x1c1917);
        this.add.rectangle(w / 2, 140, w, 4, 0xd97706, 0.8);

        // Paredes com colisão
        this._paredeTop = this.add.rectangle(w / 2, 140, w, 5, 0x000000, 0).setDepth(0);
        this.physics.add.existing(this._paredeTop, true);

        this._paredeLeft = this.add.rectangle(60, h / 2, 5, h, 0x000000, 0).setDepth(0);
        this.physics.add.existing(this._paredeLeft, true);

        this._paredeRight = this.add.rectangle(w - 60, h / 2, 5, h, 0x000000, 0).setDepth(0);
        this.physics.add.existing(this._paredeRight, true);

        this._paredeBottom = this.add.rectangle(w / 2, h - 50, w, 5, 0x000000, 0).setDepth(0);
        this.physics.add.existing(this._paredeBottom, true);

        // Letreiro da Lanchonete
        this.add.text(w / 2, 50, 'LANCHONETE & CONVENIÊNCIA', {
            fontSize: '14px', fontFamily: "'Courier New', monospace",
            color: '#fef3c7', letterSpacing: 4
        }).setOrigin(0.5);
    }

    _criarMobilia(w, h) {
        // Balcão Principal
        const balcao = this.add.rectangle(w / 2, 300, 500, 70, 0x292524).setDepth(3);
        balcao.setStrokeStyle(2, 0x78350f);
        this.physics.add.existing(balcao, true);

        // Mesas com cadeiras para os clientes
        const mesa1 = this.add.rectangle(200, 500, 100, 80, 0x78350f).setDepth(3);
        mesa1.setStrokeStyle(2, 0x92400e);
        this.physics.add.existing(mesa1, true);
        this.add.text(200, 500, '🍔', { fontSize: '28px' }).setOrigin(0.5).setDepth(4);

        const mesa2 = this.add.rectangle(w - 200, 500, 100, 80, 0x78350f).setDepth(3);
        mesa2.setStrokeStyle(2, 0x92400e);
        this.physics.add.existing(mesa2, true);
        this.add.text(w - 200, 500, '🥤', { fontSize: '28px' }).setOrigin(0.5).setDepth(4);
    }

    _criarNPCGerente(w, h) {
        this._gerenteX = w / 2 - 120;
        this._gerenteY = 240;

        this._gerente = this.add.rectangle(this._gerenteX, this._gerenteY, 28, 44, 0x16a34a).setDepth(10);
        this._gerente.setStrokeStyle(1, 0x4ade80);
        this._gerente.setInteractive({ useHandCursor: true });

        this._gerenteIcon = this.add.text(this._gerenteX, this._gerenteY - 28, '👨‍🍳', { fontSize: '22px' })
            .setOrigin(0.5).setDepth(11);

        this.add.text(this._gerenteX, this._gerenteY + 35, 'GERENTE', {
            fontSize: '11px', fontFamily: "'Courier New', monospace",
            color: '#4ade80', backgroundColor: '#0a0a1a99', padding: { x: 4, y: 2 }
        }).setOrigin(0.5).setDepth(11);

        this._gerente.on('pointerdown', () => this._interagirGerente());
    }

    _criarPontoEvidencia(w, h) {
        this._evidenciaX = w / 2 + 120;
        this._evidenciaY = 280;

        this._evidencia = this.add.rectangle(this._evidenciaX, this._evidenciaY, 36, 36, 0xd97706).setDepth(6);
        this._evidencia.setInteractive({ useHandCursor: true });

        this._evidenciaIcon = this.add.text(this._evidenciaX, this._evidenciaY, '🖥️', { fontSize: '22px' })
            .setOrigin(0.5).setDepth(7);

        this._evidenciaPulse = this.add.circle(this._evidenciaX, this._evidenciaY, 25, 0xf59e0b, 0).setDepth(4);
        this.tweens.add({
            targets: this._evidenciaPulse,
            alpha: 0.4, scaleX: 1.4, scaleY: 1.4,
            yoyo: true, repeat: -1, duration: 1000, ease: 'Sine.easeInOut'
        });

        this._evidencia.on('pointerdown', () => this._interagirEvidencia());
    }

    _criarPortaSaida(w, h) {
        this._portaX = w - 70;
        this._portaY = h / 2 + 80;

        this._porta = this.add.rectangle(this._portaX, this._portaY, 20, 110, 0x44403c).setDepth(4);
        this._portaLabel = this.add.text(this._portaX - 25, this._portaY, 'SAÍDA', {
            fontSize: '11px', fontFamily: "'Courier New', monospace",
            color: '#94a3b8', backgroundColor: '#00000099', padding: { x: 4, y: 2 }
        }).setOrigin(1, 0.5).setDepth(5).setAlpha(0.4);

        this._portaHighlight = this.add.rectangle(this._portaX, this._portaY, 30, 120, 0xfbbf24, 0).setDepth(3);
        this._portaZona = this.add.rectangle(this._portaX, this._portaY, 50, 120, 0x000000, 0).setDepth(0);
        this.physics.add.existing(this._portaZona, true);
    }

    _criarPlayer(w, h) {
        const startX = 140;
        const startY = h / 2 + 80;

        this.player = this.add.rectangle(startX, startY, 28, 44, 0x6366f1).setDepth(10);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        this._playerIcon = this.add.text(startX, startY - 28, '👮', { fontSize: '22px' }).setOrigin(0.5).setDepth(11);

        this.physics.add.collider(this.player, this._paredeTop);
        this.physics.add.collider(this.player, this._paredeLeft);
        this.physics.add.collider(this.player, this._paredeRight);
        this.physics.add.collider(this.player, this._paredeBottom);
    }

    _criarUIInstrucao(w, h) {
        this._instrBg = this.add.rectangle(w / 2, h - 80, 750, 48, 0x050c18, 0.9).setDepth(100);
        this._instrBg.setStrokeStyle(1, 0xd97706, 0.5);

        this._instrText = this.add.text(w / 2, h - 80,
            'Acesse o monitor do balcão para verificar o sistema de câmeras (CFTV)', {
                fontSize: '15px', fontFamily: "'Courier New', monospace",
                color: '#fef3c7', align: 'center'
            }).setOrigin(0.5).setDepth(101);
    }

    _configurarControles() {
        this._keys = this.input.keyboard.createCursorKeys();
        this._wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        this._teclaSpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this._teclaSpace.on('down', () => {
            if (this._fase === 'dialogo') this._avancarDialogo();
            else if (this._fase === 'missao') this._aoClicarVamos();
            else if (this._fase === 'popup_evidencia') this._aoClicarGuardar();
            else if (this._fase === 'exploracao') {
                this._interagirEvidencia();
                this._interagirGerente();
            }
        });
    }

    _processarMovimento() {
        const vel = this.velocidadePlayer;
        let vx = 0, vy = 0;

        if (this._keys.left.isDown || this._wasd.left.isDown) vx = -vel;
        else if (this._keys.right.isDown || this._wasd.right.isDown) vx = vel;
        if (this._keys.up.isDown || this._wasd.up.isDown) vy = -vel;
        else if (this._keys.down.isDown || this._wasd.down.isDown) vy = vel;

        if (vx !== 0 && vy !== 0) { vx *= 0.7071; vy *= 0.7071; }

        this.player.body.setVelocity(vx, vy);
    }

    _interagirGerente() {
        if (this._fase !== 'exploracao') return;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this._gerenteX, this._gerenteY);
        if (dist > 120) return;

        if (!this._evidenciaEncontrada) {
            this._mostrarBalaoBloqueio();
        } else {
            this._iniciarDialogo();
        }
    }

    _mostrarBalaoBloqueio() {
        if (this._balaoBloqueio) return;

        this._balaoBloqueio = this.add.rectangle(this._gerenteX + 180, this._gerenteY - 40, 480, 50, 0x0b1120, 0.95).setDepth(150);
        this._balaoBloqueio.setStrokeStyle(1, 0xd97706, 0.7);

        this._balaoTexto = this.add.text(this._gerenteX + 180, this._gerenteY - 40, TEXTO_BLOQUEIO, {
            fontSize: '12px', fontFamily: "'Courier New', monospace",
            color: '#fef3c7', wordWrap: { width: 450 }, align: 'center'
        }).setOrigin(0.5).setDepth(151);

        this.time.delayedCall(3000, () => {
            if (this._balaoBloqueio) this._balaoBloqueio.destroy();
            if (this._balaoTexto) this._balaoTexto.destroy();
            this._balaoBloqueio = null;
            this._balaoTexto = null;
        });
    }

    _interagirEvidencia() {
        if (this._evidenciaEncontrada || this._fase !== 'exploracao') return;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this._evidenciaX, this._evidenciaY);
        if (dist > 120) return;

        this._fase = 'popup_evidencia';
        this._criarPopupEvidencia();
    }

    _criarPopupEvidencia() {
        const { width, height } = this.scale;
        const popW = 620, popH = 320;
        const cx = width / 2, cy = height / 2;

        this._popupEvidenciaGrupo = [];

        this._popupOverlay = this.add.rectangle(cx, cy, width, height, 0x000000, 0.6).setDepth(200);

        const bg = this.add.rectangle(cx, cy, popW, popH, 0x0b1120, 0.98).setDepth(201);
        bg.setStrokeStyle(2, 0xd97706, 0.8);
        this._popupEvidenciaGrupo.push(bg);

        const titulo = this.add.text(cx, cy - 90, 'GRAVAÇÕES DE CÂMERA (CFTV)', {
            fontSize: '18px', fontFamily: "'Courier New', monospace",
            color: '#fbbf24', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(202);
        this._popupEvidenciaGrupo.push(titulo);

        const texto = this.add.text(cx, cy - 10, TEXTO_EVIDENCIA, {
            fontSize: '14px', fontFamily: "'Courier New', monospace",
            color: '#e2e8f0', wordWrap: { width: popW - 80 }, align: 'center', lineSpacing: 5
        }).setOrigin(0.5).setDepth(202);
        this._popupEvidenciaGrupo.push(texto);

        const btnBg = this.add.rectangle(cx, cy + 90, 220, 48, 0xd97706).setDepth(203);
        btnBg.setInteractive({ useHandCursor: true });
        this._popupEvidenciaGrupo.push(btnBg);

        const btnText = this.add.text(cx, cy + 90, '📹 EXTRAIR VÍDEO', {
            fontSize: '16px', fontFamily: "'Courier New', monospace", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(204);
        btnText.setInteractive({ useHandCursor: true });
        this._popupEvidenciaGrupo.push(btnText);

        const onGuardar = () => this._aoClicarGuardar();
        btnBg.on('pointerdown', onGuardar);
        btnText.on('pointerdown', onGuardar);
    }

    _aoClicarGuardar() {
        if (this._evidenciaEncontrada) return;
        this._evidenciaEncontrada = true;

        GameState.adicionarItem('gravacao_cftv_lanchonete');
        GameState.anotarPista('video_agressao_lanchonete');

        this._popupEvidenciaGrupo.forEach(o => o.destroy());
        if (this._popupOverlay) this._popupOverlay.destroy();

        this._evidencia.destroy();
        this._evidenciaIcon.destroy();
        this._evidenciaPulse.destroy();

        this._instrText.setText('Agora interrogue o gerente da lanchonete');
        this._instrText.setColor('#fbbf24');

        this._fase = 'exploracao';
    }

    _iniciarDialogo() {
        this._fase = 'dialogo';
        this._dialogoIndex = 0;
        this._criarDialogo();
    }

    _criarDialogo() {
        const { width, height } = this.scale;
        const boxH = 220;
        const boxY = height - boxH / 2 - 15;

        this._roteiro = DIALOGO_CENA03;
        this._dialogoGrupo = [];

        // Fundo da caixa de diálogo
        const box = this.add.rectangle(width / 2, boxY, width - 40, boxH, 0x0b1120, 0.96).setDepth(150);
        box.setStrokeStyle(2, 0xd97706, 0.8);
        this._dialogoGrupo.push(box);

        // Retrato Policial (Esquerda)
        this._retratoBoxEsq = this.add.rectangle(90, boxY, 90, 110, 0x1e293b).setDepth(151);
        this._retratoEmojiEsq = this.add.text(90, boxY - 10, '👮', { fontSize: '38px' }).setOrigin(0.5).setDepth(152);
        this._nomeBadgeEsqBg = this.add.rectangle(90, boxY + 40, 90, 22, 0x6366f1).setDepth(152);
        this._nomeTextEsq = this.add.text(90, boxY + 40, 'DETETIVE', { fontSize: '10px', fontFamily: "'Courier New', monospace", color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(153);
        this._dialogoGrupo.push(this._retratoBoxEsq, this._retratoEmojiEsq, this._nomeBadgeEsqBg, this._nomeTextEsq);

        // Retrato Gerente (Direita)
        this._retratoBoxDir = this.add.rectangle(width - 90, boxY, 90, 110, 0x1e293b).setDepth(151);
        this._retratoEmojiDir = this.add.text(width - 90, boxY - 10, '👨‍🍳', { fontSize: '38px' }).setOrigin(0.5).setDepth(152);
        this._nomeBadgeDirBg = this.add.rectangle(width - 90, boxY + 40, 90, 22, 0x16a34a).setDepth(152);
        this._nomeTextDir = this.add.text(width - 90, boxY + 40, 'GERENTE', { fontSize: '10px', fontFamily: "'Courier New', monospace", color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(153);
        this._dialogoGrupo.push(this._retratoBoxDir, this._retratoEmojiDir, this._nomeBadgeDirBg, this._nomeTextDir);

        // Texto principal
        this._dialogoText = this.add.text(160, boxY - 55, '', {
            fontSize: '17px', fontFamily: "'Courier New', monospace",
            color: '#e2e8f0', wordWrap: { width: width - 320 }, lineSpacing: 6
        }).setOrigin(0, 0).setDepth(153);
        this._dialogoGrupo.push(this._dialogoText);

        // Contador
        this._contadorText = this.add.text(width / 2, boxY + 80, '', {
            fontSize: '12px', fontFamily: "'Courier New', monospace", color: '#64748b'
        }).setOrigin(0.5).setDepth(153);
        this._dialogoGrupo.push(this._contadorText);

        // Texto avançar
        this._continuarText = this.add.text(width / 2, boxY + 60, 'Clique para continuar ▶', {
            fontSize: '12px', fontFamily: "'Courier New', monospace", color: '#fbbf24'
        }).setOrigin(0.5, 1).setDepth(153);
        this.tweens.add({
            targets: this._continuarText,
            alpha: 0.25, yoyo: true, repeat: -1, duration: 750
        });
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

        this._typewriterText(fala.texto);
        this._contadorText.setText(`${this._dialogoIndex + 1} / ${this._roteiro.length}`);
    }

    _typewriterText(fullText) {
        this._dialogoText.setText('');
        this._twChars = fullText.split('');
        this._twIndex = 0;
        this._twTarget = fullText;

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
        if (this._twIndex < this._twChars.length) {
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

                GameState.anotarPista('depoimento_gerente_lanchonete');
                GameState.registrarAnotacaoInterrogatorio(
                    'gerente', 'Gerente da Lanchonete', GameState.diaAtual,
                    'Depoimento e imagens confirmam perseguição e ameaças. Provas suficientes para a prisão do agressor.'
                );

                this.time.delayedCall(400, () => this._mostrarPopupMissao());
            }
        });
    }

    _mostrarPopupMissao() {
        this._fase = 'missao';
        const { width, height } = this.scale;

        this._missaoOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setDepth(200);
        this._missaoOverlay.setAlpha(0);

        const popW = 620, popH = 340;
        const cx = width / 2, cy = height / 2;

        this._missaoGrupo = [];

        const popBg = this.add.rectangle(cx, cy, popW, popH, 0x0b1120, 0.98).setDepth(201);
        popBg.setStrokeStyle(2, 0xd97706, 0.9);
        this._missaoGrupo.push(popBg);

        const icone = this.add.text(cx, cy - 110, '⚖️', { fontSize: '42px' }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(icone);

        const titulo = this.add.text(cx, cy - 55, 'CASO PRONTO PARA CONFRONTO', {
            fontSize: '20px', fontFamily: "'Courier New', monospace",
            color: '#f8fafc', fontStyle: 'bold', letterSpacing: 2
        }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(titulo);

        const objetivo = this.add.text(cx, cy + 5, '📌  Retornar à Delegacia / Julgamento', {
            fontSize: '18px', fontFamily: "'Courier New', monospace",
            color: '#fbbf24', align: 'center'
        }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(objetivo);

        const pista = this.add.text(cx, cy + 45, '🔍  Provas Coletadas: Mensagens de violência\npsicológica + Vídeo CFTV de perseguição', {
            fontSize: '14px', fontFamily: "'Courier New', monospace",
            color: '#94a3b8', align: 'center', lineSpacing: 5
        }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(pista);

        const btnBg = this.add.rectangle(cx, cy + 120, 240, 55, 0xd97706).setDepth(203);
        btnBg.setInteractive({ useHandCursor: true });
        this._missaoGrupo.push(btnBg);

        const btnText = this.add.text(cx, cy + 120, '▶  PRENDER AGRESSOR', {
            fontSize: '17px', fontFamily: "'Courier New', monospace",
            color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(204);
        btnText.setInteractive({ useHandCursor: true });
        this._missaoGrupo.push(btnText);

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

    _ativarPortaSaida() {
        this._fase = 'saida';

        this._portaHighlight.setStrokeStyle(3, 0xfbbf24, 0.8);
        this.tweens.add({
            targets: this._portaHighlight,
            alpha: 0.9, yoyo: true, repeat: -1, duration: 800, ease: 'Sine.easeInOut'
        });

        this._portaSeta = this.add.text(this._portaX, this._portaY - 90, '▼', {
            fontSize: '28px', fontFamily: "'Courier New', monospace",
            color: '#fbbf24', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20);

        this._portaLabel.setAlpha(1);
        this._portaLabel.setColor('#fbbf24');

        const { width, height } = this.scale;
        this._saidaText = this.add.text(width / 2, height - 100,
            'Dirija-se à saída para conduzir o suspeito à delegacia', {
                fontSize: '16px', fontFamily: "'Courier New', monospace",
                color: '#fbbf24', align: 'center',
                backgroundColor: '#050c18dd', padding: { x: 15, y: 8 }
            }).setOrigin(0.5).setDepth(100);

        this._porta.setInteractive({ useHandCursor: true });
        this._porta.on('pointerdown', () => this._sairLanchonete());

        this.physics.add.overlap(this.player, this._portaZona, () => this._sairLanchonete());
    }

    _sairLanchonete() {
        if (this._fase !== 'saida') return;
        this._fase = 'transicao';

        GameState.flags.fase_03_concluida = true;
        GameState.flags.objetivo_atual = 'confrontar_agressor';

        this.cameras.main.fadeOut(1200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Direciona para a cena de Julgamento / Confronto Final
            this.scene.start('JulgamentoScene');
        });
    }
}
