/**
 * TutorialScene — Cena 01: O Chamado (Tutorial e Introdução)
 */
import { GameState } from '../utils/GameState.js';

export class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TutorialScene' });
    }

    init() {
        this.velocidadePlayer = 260;
        this._fase = 'movimento';      // 'movimento' | 'perto_telefone' | 'dialogo' | 'missao' | 'saida' | 'transicao' | 'encerrando_dialogo' | 'saindo_missao'
        this._dialogoIndex = 0;
        
        // Atributos do Web Audio
        this._phoneOsc = null;
        this._phoneGain = null;
        this._phoneTimerEvent = null;
        this._ultimaDirecao = 'baixo';
        
        // Atributos do Typewriter e UI
        this._twTimer = null;
        this._twChars = [];
        this._twIndex = 0;
        this._twTarget = '';
        this._pointerHandler = null;
        this._dialogoGrupo = [];
        this._missaoGrupo = [];
        this._overlapPorta = null; // Guardar referência do overlap para remoção segura
    }

    preload() {
        this.load.spritesheet('policial_sheet', 'assets/Protagonista.png', {
            frameWidth: 14,
            frameHeight: 31
        });
    }

    create() {
        const { width, height } = this.scale;

        this._criarAnimacoesGlobais();
        this._criarDelegacia(width, height);
        this._criarPlayer(width, height);
        this._criarTelefone();
        this._criarPorta(width, height);
        this._criarUITutorial(width, height);
        this._configurarControles();
        this._iniciarSomTelefone();

        // Fade in da câmera
        this.cameras.main.fadeIn(900, 0, 0, 0);

        // Garante a limpeza correta ao destruir/trocar a cena
        this.events.once('shutdown', this._limparRecursos, this);
        this.events.once('destroy', this._limparRecursos, this);
    }

    update() {
        // Bloqueia movimentação durante diálogos, popups e transições
        const fasesBloqueadas = ['dialogo', 'missao', 'transicao', 'encerrando_dialogo', 'saindo_missao'];
        if (fasesBloqueadas.includes(this._fase)) {
            if (this.player && this.player.body && this.player.body.velocity.lengthSq() > 0) {
                this.player.body.setVelocity(0);
                this.player.anims.stop();
            }
            return;
        }

        this._processarMovimento();

        // Checa proximidade do telefone apenas se estiver na fase adequada
        if (this._fase === 'movimento' || this._fase === 'perto_telefone') {
            this._verificarProximidadeTelefone();
        }
    }

    _criarAnimacoesGlobais() {
        const animsParaCriar = [
            { key: 'andar_baixo', start: 0, end: 3 },
            { key: 'andar_esquerda', start: 4, end: 7 },
            { key: 'andar_cima', start: 8, end: 11 },
            { key: 'andar_direita', start: 12, end: 15 }
        ];

        animsParaCriar.forEach(anim => {
            if (!this.anims.exists(anim.key)) {
                this.anims.create({
                    key: anim.key,
                    frames: this.anims.generateFrameNumbers('policial_sheet', { start: anim.start, end: anim.end }),
                    frameRate: 8,
                    repeat: -1
                });
            }
        });
    }

    _criarDelegacia(w, h) {
        // Chão
        this.add.rectangle(w / 2, h / 2, w, h, 0x111d36);
        this.add.grid(w / 2, h / 2, w, h, 64, 64, 0, 0, 0x1e293b, 0.08);

        // Paredes
        this.add.rectangle(w / 2, 80, w, 80, 0x0a1628);
        this.add.rectangle(w / 2, 120, w, 3, 0x334155, 0.9);
        this.add.rectangle(40, h / 2, 80, h, 0x0a1628);
        this.add.rectangle(80, h / 2, 3, h, 0x334155, 0.5);
        this.add.rectangle(w - 40, h / 2, 80, h, 0x0a1628);
        this.add.rectangle(w - 80, h / 2, 3, h, 0x334155, 0.5);
        this.add.rectangle(w / 2, h - 30, w, 60, 0x0a1628);

        // Label
        this.add.text(w / 2, 95, 'DELEGACIA DE CEILÂNDIA', {
            fontSize: '16px', fontFamily: "'Courier New', monospace",
            color: '#334155', letterSpacing: 5
        }).setOrigin(0.5);

        // Quadro na parede (esquerda)
        const quadro = this.add.rectangle(250, 94, 120, 55, 0x1e293b);
        quadro.setStrokeStyle(2, 0x475569);
        this.add.text(250, 94, '⚖️ LEI & ORDEM', {
            fontSize: '11px', fontFamily: "'Courier New', monospace", color: '#64748b'
        }).setOrigin(0.5);

        // Arquivo / armário (esquerda)
        const armario = this.add.rectangle(130, 400, 70, 200, 0x1a2a40).setDepth(2);
        armario.setStrokeStyle(1, 0x334155);
        this.add.text(130, 400, '📁', { fontSize: '28px' }).setOrigin(0.5).setDepth(3);

        // Mesa do detetive (centro-esquerda)
        this._mesaDetetive = this.add.rectangle(500, 520, 240, 90, 0x5c2d0a).setDepth(4);
        this._mesaDetetive.setStrokeStyle(1, 0x8b5e34);
        this.physics.add.existing(this._mesaDetetive, true);

        // Cadeira (atrás da mesa)
        this.add.rectangle(500, 440, 50, 50, 0x2d1a0a).setDepth(3);
        this.add.rectangle(500, 416, 50, 6, 0x3d2a1a).setDepth(3);

        // Mesa auxiliar (direita)
        const mesaAux = this.add.rectangle(1100, 650, 180, 70, 0x5c2d0a).setDepth(4);
        mesaAux.setStrokeStyle(1, 0x8b5e34);
        this.physics.add.existing(mesaAux, true);

        // Papéis na mesa auxiliar
        this.add.rectangle(1060, 645, 30, 38, 0xfef9c3, 0.7).setDepth(5);
        this.add.rectangle(1130, 640, 28, 36, 0xfef9c3, 0.5).setDepth(5).setAngle(8);

        // Cadeira secundária
        this.add.rectangle(1100, 590, 45, 45, 0x2d1a0a).setDepth(3);

        // Quadro de avisos
        const quadroAvisos = this.add.rectangle(1400, 94, 180, 60, 0x1e293b);
        quadroAvisos.setStrokeStyle(2, 0x475569);
        this.add.text(1400, 85, '📌 QUADRO DE AVISOS', {
            fontSize: '10px', fontFamily: "'Courier New', monospace", color: '#64748b'
        }).setOrigin(0.5);
        this.add.rectangle(1370, 100, 22, 18, 0xfbbf24, 0.6);
        this.add.rectangle(1410, 100, 22, 18, 0xef4444, 0.4);
        this.add.rectangle(1440, 100, 22, 18, 0x22d3ee, 0.5);

        // Planta decorativa e Relógio
        this.add.text(1750, 200, '🪴', { fontSize: '32px' }).setOrigin(0.5).setDepth(3);
        this.add.text(850, 88, '🕐', { fontSize: '22px' }).setOrigin(0.5);

        // Colisão com paredes
        this._paredeTop = this.add.rectangle(w / 2, 120, w, 5, 0x000000, 0).setDepth(0);
        this._paredeLeft = this.add.rectangle(80, h / 2, 5, h, 0x000000, 0).setDepth(0);
        this._paredeRight = this.add.rectangle(w - 80, h / 2, 5, h, 0x000000, 0).setDepth(0);
        this._paredeBottom = this.add.rectangle(w / 2, h - 60, w, 5, 0x000000, 0).setDepth(0);

        [this._paredeTop, this._paredeLeft, this._paredeRight, this._paredeBottom].forEach(parede => {
            this.physics.add.existing(parede, true);
        });
    }

    _criarPlayer() {
        this.player = this.physics.add.sprite(500, 640, 'policial_sheet');
        this.player.setDepth(10);
        this.player.setScale(2);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setSize(12, 20);
        this.player.body.setOffset(1, 10);
        this.player.setFrame(0);

        this.physics.add.collider(this.player, this._mesaDetetive);
        this.physics.add.collider(this.player, [this._paredeTop, this._paredeLeft, this._paredeRight, this._paredeBottom]);
    }

    _criarTelefone() {
        this._telefoneX = 560;
        this._telefoneY = 500;

        this._telefone = this.add.rectangle(this._telefoneX, this._telefoneY, 36, 24, 0x1e293b).setDepth(6);
        this._telefone.setStrokeStyle(1, 0x475569);
        this._telefone.setInteractive({ useHandCursor: true });

        this._telefoneIcon = this.add.text(this._telefoneX, this._telefoneY, '📞', { fontSize: '18px' }).setOrigin(0.5).setDepth(7);

        this.tweens.add({
            targets: [this._telefone, this._telefoneIcon],
            x: this._telefoneX + 3,
            yoyo: true, repeat: -1, duration: 80, ease: 'Sine.easeInOut'
        });

        this._setaTelefone = this.add.text(this._telefoneX, this._telefoneY - 55, '▼', {
            fontSize: '28px', fontFamily: "'Courier New', monospace", color: '#fbbf24', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
            targets: this._setaTelefone,
            y: this._telefoneY - 40,
            yoyo: true, repeat: -1, duration: 600, ease: 'Sine.easeInOut'
        });

        this._telefoneGlow = this.add.rectangle(this._telefoneX, this._telefoneY, 50, 38, 0xfbbf24, 0)
            .setStrokeStyle(2, 0xfbbf24, 0.5).setDepth(5);
            
        this.tweens.add({
            targets: this._telefoneGlow,
            alpha: 0.9, yoyo: true, repeat: -1, duration: 800, ease: 'Sine.easeInOut'
        });

        this._telefone.on('pointerdown', () => this._tentarAtenderTelefone());
    }

    _criarPorta(w, h) {
        this._portaX = w - 80;
        this._portaY = h / 2;

        this._porta = this.add.rectangle(this._portaX, this._portaY, 20, 110, 0x5c2d0a).setDepth(4);
        this._porta.setStrokeStyle(1, 0x8b5e34);

        this.add.circle(this._portaX - 4, this._portaY, 4, 0xfbbf24).setDepth(5);

        this._portaLabel = this.add.text(this._portaX + 20, this._portaY, 'SAÍDA', {
            fontSize: '11px', fontFamily: "'Courier New', monospace",
            color: '#475569', backgroundColor: '#00000099', padding: { x: 4, y: 2 }
        }).setOrigin(0, 0.5).setDepth(5).setAlpha(0.5);

        this._portaHighlight = this.add.rectangle(this._portaX, this._portaY, 30, 120, 0xfbbf24, 0)
            .setStrokeStyle(3, 0xfbbf24, 0).setDepth(3);

        this._portaZona = this.add.rectangle(this._portaX, this._portaY, 40, 120, 0x000000, 0).setDepth(0);
        this.physics.add.existing(this._portaZona, true);
    }

    _criarUITutorial(w, h) {
        this._tutorialBg = this.add.rectangle(w / 2, h - 110, 700, 55, 0x050c18, 0.92).setDepth(100);
        this._tutorialBg.setStrokeStyle(1, 0x6366f1, 0.6);

        this._tutorialText = this.add.text(w / 2, h - 110,
            'Use as setas do teclado (ou W, A, S, D) para se mover', {
                fontSize: '17px', fontFamily: "'Courier New', monospace",
                color: '#e2e8f0', align: 'center'
            }).setOrigin(0.5).setDepth(101);

        this._tutorialBg.setAlpha(0);
        this._tutorialText.setAlpha(0);
        this.tweens.add({ targets: [this._tutorialBg, this._tutorialText], alpha: 1, duration: 800, delay: 500 });
    }

    _configurarControles() {
        this._keys = this.input.keyboard.createCursorKeys();
        this._wasd = this.input.keyboard.addKeys({
            up:    Phaser.Input.Keyboard.KeyCodes.W,
            down:  Phaser.Input.Keyboard.KeyCodes.S,
            left:  Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        this._teclaSpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this._teclaSpace.on('down', () => {
            if (this._fase === 'perto_telefone') this._tentarAtenderTelefone();
            else if (this._fase === 'dialogo') this._avancarDialogo();
            else if (this._fase === 'missao') this._aoClicarVamos();
        });
    }

    _processarMovimento() {
        let vx = 0, vy = 0;

        if (this._keys.left.isDown || this._wasd.left.isDown) vx = -1;
        else if (this._keys.right.isDown || this._wasd.right.isDown) vx = 1;

        if (this._keys.up.isDown || this._wasd.up.isDown) vy = -1;
        else if (this._keys.down.isDown || this._wasd.down.isDown) vy = 1;

        // Normalização do vetor para movimento diagonal correto
        if (vx !== 0 || vy !== 0) {
            const mag = Math.sqrt(vx * vx + vy * vy);
            vx = (vx / mag) * this.velocidadePlayer;
            vy = (vy / mag) * this.velocidadePlayer;
        }

        this.player.body.setVelocity(vx, vy);

        // Controle de Animações
        if (vx < 0) {
            this.player.anims.play('andar_esquerda', true);
            this._ultimaDirecao = 'esquerda';
        } else if (vx > 0) {
            this.player.anims.play('andar_direita', true);
            this._ultimaDirecao = 'direita';
        } else if (vy < 0) {
            this.player.anims.play('andar_cima', true);
            this._ultimaDirecao = 'cima';
        } else if (vy > 0) {
            this.player.anims.play('andar_baixo', true);
            this._ultimaDirecao = 'baixo';
        } else {
            this.player.anims.stop();
            switch(this._ultimaDirecao) {
                case 'baixo': this.player.setFrame(0); break;
                case 'esquerda': this.player.setFrame(4); break;
                case 'cima': this.player.setFrame(8); break;
                case 'direita': this.player.setFrame(12); break;
            }
        }
    }

    _iniciarSomTelefone() {
        try {
            // Verificação de segurança robusta para WebAudio
            if (!this.sound || !this.sound.context) return;
            const ctx = this.sound.context;

            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => { /* Abafa o erro silenciosamente se o navegador bloquear autoplay */ });
            }

            this._phoneGain = ctx.createGain();
            this._phoneGain.gain.value = 0;
            this._phoneGain.connect(ctx.destination);

            const startRing = () => {
                if (this._fase !== 'movimento' && this._fase !== 'perto_telefone') {
                    this._pararSomTelefone();
                    return;
                }
                
                if (this._phoneOsc) {
                    try { this._phoneOsc.stop(); this._phoneOsc.disconnect(); } catch (_) {}
                }
                
                this._phoneOsc = ctx.createOscillator();
                this._phoneOsc.type = 'sine';
                this._phoneOsc.frequency.value = 440;
                this._phoneOsc.connect(this._phoneGain);
                this._phoneGain.gain.value = 0.08;
                this._phoneOsc.start();

                this.time.delayedCall(400, () => {
                    if (this._phoneGain) this._phoneGain.gain.value = 0;
                    this.time.delayedCall(150, () => {
                        if (this._phoneGain) this._phoneGain.gain.value = 0.08;
                        if (this._phoneOsc) this._phoneOsc.frequency.value = 480;
                        this.time.delayedCall(400, () => {
                            if (this._phoneGain) this._phoneGain.gain.value = 0;
                            if (this._phoneOsc) {
                                try { this._phoneOsc.stop(); this._phoneOsc.disconnect(); } catch (_) {}
                                this._phoneOsc = null;
                            }
                        });
                    });
                });
            };

            this._phoneTimerEvent = this.time.addEvent({
                delay: 2500, callback: startRing, loop: true
            });
            startRing();
            
        } catch (e) {
            // Falha graciosa caso o Audio Context não suporte o script acima
        }
    }

    _pararSomTelefone() {
        if (this._phoneTimerEvent) {
            this._phoneTimerEvent.remove();
            this._phoneTimerEvent = null;
        }
        if (this._phoneOsc) {
            try { this._phoneOsc.stop(); } catch (_) {}
            try { this._phoneOsc.disconnect(); } catch (_) {}
            this._phoneOsc = null;
        }
        if (this._phoneGain) {
            this._phoneGain.gain.value = 0;
        }
    }

    _verificarProximidadeTelefone() {
        const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y, this._telefoneX, this._telefoneY
        );

        if (dist <= 150 && this._fase === 'movimento') {
            this._fase = 'perto_telefone';
            this._tutorialText.setText("Clique no telefone (ou pressione 'ESPAÇO') para atender");
            this.tweens.add({ targets: this._tutorialBg, width: 680, duration: 200 });
        } else if (dist > 150 && this._fase === 'perto_telefone') {
            this._fase = 'movimento';
            this._tutorialText.setText('Use as setas do teclado (ou W, A, S, D) para se mover');
        }
    }

    _tentarAtenderTelefone() {
        if (this._fase !== 'perto_telefone') return;

        const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y, this._telefoneX, this._telefoneY
        );
        if (dist > 150) return;

        this._fase = 'dialogo';
        this._dialogoIndex = 0;

        this._pararSomTelefone();
        this.tweens.killTweensOf([this._telefone, this._telefoneIcon, this._setaTelefone, this._telefoneGlow]);
        this._telefone.setPosition(this._telefoneX, this._telefoneY);
        this._telefoneIcon.setPosition(this._telefoneX, this._telefoneY);
        this._setaTelefone.setVisible(false);
        this._telefoneGlow.setVisible(false);

        this.tweens.add({
            targets: [this._tutorialBg, this._tutorialText],
            alpha: 0, duration: 300,
            onComplete: () => {
                if (this._tutorialBg) this._tutorialBg.setVisible(false);
                if (this._tutorialText) this._tutorialText.setVisible(false);
            }
        });

        this.time.delayedCall(400, () => this._criarDialogo());
    }

    _criarDialogo() {
        const { width, height } = this.scale;
        const boxH = 230;
        const boxY = height - boxH / 2 - 10;

        this._roteiro = [
            { falante: 'detetive', nome: 'DETETIVE', texto: 'Delegacia de Ceilândia. Investigador falando.', corNome: 0x6366f1, retrato: '👮', retratoBg: 0x1e3a5f, tremido: false },
            { falante: 'mae', nome: 'VOZ MISTERIOSA', texto: 'Por favor... me ajude! Minha filha não voltou para casa desde ontem... Estou desesperada.', corNome: 0x475569, retrato: '📞', retratoBg: 0x0a0a0a, tremido: true },
            { falante: 'detetive', nome: 'DETETIVE', texto: 'Acalme-se, senhora. Vou registrar a ocorrência. Onde e com quem ela foi vista pela última vez?', corNome: 0x6366f1, retrato: '👮', retratoBg: 0x1e3a5f, tremido: false },
            { falante: 'mae', nome: 'VOZ MISTERIOSA', texto: 'Ela me disse que ia passar na casa de uma amiga... Fica na Rua das Rosas, casa 12.', corNome: 0x475569, retrato: '📞', retratoBg: 0x0a0a0a, tremido: true },
            { falante: 'detetive', nome: 'DETETIVE', texto: 'Entendido. Estou indo para lá iniciar as buscas agora mesmo.', corNome: 0x6366f1, retrato: '👮', retratoBg: 0x1e3a5f, tremido: false }
        ];

        this._dialogoGrupo = [];

        const overlay = this.add.rectangle(width / 2, (height - boxH) / 2, width, height - boxH, 0x000000, 0.4).setDepth(150);
        const box = this.add.rectangle(width / 2, boxY, width - 30, boxH, 0x0b1120, 0.97).setDepth(150).setStrokeStyle(2, 0x6366f1, 0.9);
        this._retratoBox = this.add.rectangle(120, boxY, 130, 130, 0x1e3a5f).setDepth(151).setStrokeStyle(2, 0x6366f1, 0.8);
        this._retratoEmoji = this.add.text(120, boxY, '👮', { fontSize: '52px' }).setOrigin(0.5).setDepth(152);
        this._silhueta = this.add.rectangle(120, boxY, 130, 130, 0x050505, 0.85).setDepth(152).setVisible(false);
        this._nomeBadgeBg = this.add.rectangle(120, boxY - 82, 150, 32, 0x6366f1).setDepth(153);
        
        this._nomeText = this.add.text(120, boxY - 82, 'DETETIVE', {
            fontSize: '13px', fontFamily: "'Courier New', monospace", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(154);
        
        this._dialogoText = this.add.text(210, boxY - 50, '', {
            fontSize: '19px', fontFamily: "'Courier New', monospace", color: '#e2e8f0', wordWrap: { width: width - 270 }, lineSpacing: 8
        }).setOrigin(0, 0).setDepth(153);
        
        this._contadorText = this.add.text(width - 40, boxY - boxH / 2 + 18, '', {
            fontSize: '13px', fontFamily: "'Courier New', monospace", color: '#475569'
        }).setOrigin(1, 0.5).setDepth(153);
        
        this._continuarText = this.add.text(width - 40, boxY + boxH / 2 - 22, '▶  CLIQUE  /  ESPAÇO', {
            fontSize: '13px', fontFamily: "'Courier New', monospace", color: '#6366f1'
        }).setOrigin(1, 1).setDepth(153);
        
        this.tweens.add({
            targets: this._continuarText, alpha: 0.25, yoyo: true, repeat: -1, duration: 750
        });

        this._dialogoGrupo.push(overlay, box, this._retratoBox, this._retratoEmoji, this._silhueta, this._nomeBadgeBg, this._nomeText, this._dialogoText, this._contadorText, this._continuarText);

        this._pointerHandler = () => {
            if (this._fase === 'dialogo') this._avancarDialogo();
        };
        this.input.on('pointerdown', this._pointerHandler);

        this._mostrarFala();
    }

    _mostrarFala() {
        if (this._dialogoIndex >= this._roteiro.length) {
            this._encerrarDialogo();
            return;
        }

        const fala = this._roteiro[this._dialogoIndex];

        this._retratoEmoji.setText(fala.retrato);
        this._retratoBox.setFillStyle(fala.retratoBg);
        this._nomeBadgeBg.setFillStyle(fala.corNome);
        this._nomeText.setText(fala.nome);
        this._silhueta.setVisible(fala.falante === 'mae');

        if (fala.tremido) {
            this._dialogoText.setColor('#94a3b8');
            this._dialogoText.setFontStyle('italic');
        } else {
            this._dialogoText.setColor('#e2e8f0');
            this._dialogoText.setFontStyle('normal');
        }

        this._typewriterText(fala.texto);
        this._contadorText.setText(`${this._dialogoIndex + 1} / ${this._roteiro.length}`);
    }

    _typewriterText(fullText) {
        if (this._twTimer) {
            this._twTimer.remove();
            this._twTimer = null;
        }

        this._dialogoText.setText('');
        this._twChars = fullText ? fullText.split('') : [];
        this._twIndex = 0;
        this._twTarget = fullText || '';

        if (this._twChars.length === 0) return;

        this._twTimer = this.time.addEvent({
            delay: 28,
            repeat: this._twChars.length - 1,
            callback: () => {
                if (!this._dialogoText || !this._dialogoText.active) return;
                this._twIndex++;
                this._dialogoText.setText(this._twTarget.substring(0, this._twIndex));
            }
        });
    }

    _avancarDialogo() {
        if (this._twChars && this._twIndex < this._twChars.length) {
            if (this._twTimer) {
                this._twTimer.remove();
                this._twTimer = null;
            }
            this._dialogoText.setText(this._twTarget);
            this._twIndex = this._twChars.length;
            return;
        }

        this._dialogoIndex++;
        this._mostrarFala();
    }

    _encerrarDialogo() {
        this._fase = 'encerrando_dialogo';

        if (this._twTimer) {
            this._twTimer.remove();
            this._twTimer = null;
        }

        if (this._pointerHandler) {
            this.input.off('pointerdown', this._pointerHandler);
            this._pointerHandler = null;
        }

        this.tweens.add({
            targets: this._dialogoGrupo,
            alpha: 0, duration: 400,
            onComplete: () => {
                this._dialogoGrupo.forEach(obj => { if (obj && obj.destroy) obj.destroy(); });
                this._dialogoGrupo = [];
                this.time.delayedCall(300, () => this._mostrarPopupMissao());
            }
        });
    }

    _mostrarPopupMissao() {
        this._fase = 'missao';
        const { width, height } = this.scale;
        
        this._missaoOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setDepth(200).setAlpha(0);
        
        const popW = 600, popH = 320, popX = width / 2, popY = height / 2;
        this._missaoGrupo = [];

        const popBg = this.add.rectangle(popX, popY, popW, popH, 0x0b1120, 0.98).setDepth(201).setStrokeStyle(2, 0x6366f1, 0.9);
        const linhaTop = this.add.rectangle(popX, popY - popH / 2 + 50, popW - 40, 2, 0x6366f1, 0.4).setDepth(202);
        const icone = this.add.text(popX, popY - 100, '🔍', { fontSize: '42px' }).setOrigin(0.5).setDepth(202);
        
        const titulo = this.add.text(popX, popY - 50, 'NOVO CASO: DESAPARECIMENTO', {
            fontSize: '24px', fontFamily: "'Courier New', monospace", color: '#f8fafc', fontStyle: 'bold', letterSpacing: 3
        }).setOrigin(0.5).setDepth(202);
        
        const sep = this.add.rectangle(popX, popY - 20, 200, 1, 0x334155).setDepth(202);
        
        const descricao = this.add.text(popX, popY + 15, '📌  Pista 1: Rua das Rosas, casa 12', {
            fontSize: '18px', fontFamily: "'Courier New', monospace", color: '#fbbf24', align: 'center'
        }).setOrigin(0.5).setDepth(202);
        
        const subdesc = this.add.text(popX, popY + 50, 'Uma mãe desesperada precisa de ajuda.\nEncontre sua filha desaparecida.', {
            fontSize: '15px', fontFamily: "'Courier New', monospace", color: '#94a3b8', align: 'center', lineSpacing: 5
        }).setOrigin(0.5).setDepth(202);

        const btnBg = this.add.rectangle(popX, popY + 115, 220, 55, 0x6366f1).setDepth(203).setInteractive({ useHandCursor: true });
        
        const btnText = this.add.text(popX, popY + 115, '▶  VAMOS', {
            fontSize: '20px', fontFamily: "'Courier New', monospace", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(204);

        this.tweens.add({ targets: btnText, alpha: 0.65, yoyo: true, repeat: -1, duration: 1000, ease: 'Sine.easeInOut', delay: 600 });

        btnBg.on('pointerover', () => {
            this.tweens.add({ targets: [btnBg, btnText], scaleX: 1.05, scaleY: 1.05, duration: 120 });
            btnBg.setFillStyle(0x4f46e5);
        });
        btnBg.on('pointerout', () => {
            this.tweens.add({ targets: [btnBg, btnText], scaleX: 1, scaleY: 1, duration: 120 });
            btnBg.setFillStyle(0x6366f1);
        });
        btnBg.on('pointerdown', () => this._aoClicarVamos());

        this._missaoGrupo.push(popBg, linhaTop, icone, titulo, sep, descricao, subdesc, btnBg, btnText);
        this._missaoGrupo.forEach(obj => obj.setAlpha(0));

        this.tweens.add({ targets: this._missaoOverlay, alpha: 1, duration: 400 });
        this.tweens.add({ targets: this._missaoGrupo, alpha: 1, duration: 500, delay: 200, ease: 'Power2' });
    }

    _aoClicarVamos() {
        if (this._fase !== 'missao') return;
        this._fase = 'saindo_missao';

        this._missaoGrupo.forEach(obj => {
            this.tweens.killTweensOf(obj);
            if (obj && obj.disableInteractive) obj.disableInteractive();
            if (obj && obj.destroy) obj.destroy();
        });
        this._missaoGrupo = [];
        
        if (this._missaoOverlay) {
            this.tweens.killTweensOf(this._missaoOverlay);
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
            fontSize: '28px', fontFamily: "'Courier New', monospace", color: '#fbbf24', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
            targets: this._portaSeta,
            y: this._portaY - 75, yoyo: true, repeat: -1, duration: 600, ease: 'Sine.easeInOut'
        });

        this._portaLabel.setAlpha(1);
        this._portaLabel.setColor('#fbbf24');

        const { width, height } = this.scale;
        this._saidaText = this.add.text(width / 2, height - 110,
            'Dirija-se à porta de saída para iniciar a investigação', {
                fontSize: '17px', fontFamily: "'Courier New', monospace", color: '#fbbf24', align: 'center',
                backgroundColor: '#050c18dd', padding: { x: 15, y: 8 }
            }).setOrigin(0.5).setDepth(100);

        this._porta.setInteractive({ useHandCursor: true });
        this._porta.on('pointerdown', () => this._sairDelegacia());

        this._overlapPorta = this.physics.add.overlap(this.player, this._portaZona, () => this._sairDelegacia());
    }

    _sairDelegacia() {
        if (this._fase !== 'saida') return;
        this._fase = 'transicao';

        // Previne chamadas múltiplas de colisão da zona da porta
        if (this._overlapPorta) {
            this._overlapPorta.destroy();
        }

        GameState.flags.tutorial_completo = true;
        GameState.flags.objetivo_atual = 'ir_para_rua_das_rosas';
        GameState.flags.cenario_02_desbloqueado = true;

        this.cameras.main.fadeOut(1200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this._limparRecursos();
            this.scene.start('Cena2Scene');
        });
    }

    _limparRecursos() {
        this._pararSomTelefone();

        if (this._twTimer) {
            this._twTimer.remove();
            this._twTimer = null;
        }

        if (this._pointerHandler) {
            this.input.off('pointerdown', this._pointerHandler);
            this._pointerHandler = null;
        }
    }
}
