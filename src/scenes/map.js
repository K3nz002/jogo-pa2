/**
 * MapaScene — Cena principal de exploração.
 *
 * Layout do mundo (1920x1080):
 *   DELEGACIA      (x: 0–340)      — base do detetive
 *   HALL / ENTRADA (x: 340–720)    — hall da mansão, computador, Ricardo NPC
 *   SALA DE ESTAR  (x: 720–1100)   — copo, Elena NPC, sofá
 *   ESCRITÓRIO     (x: 1100–1500)  — mesa, carta, agenda
 *   QUARTO         (x: 1500–1920)  — nota falsa, digital, cama, Marco NPC
 *   JARDIM         (x: 720–1920, y: 700–1015) — frasco de veneno
 *
 * HUD fixo na câmera (y: 0–68).
 * Physics world bounds: (0, 68, 1920, 1012).
 */

import { GameState } from '../utils/GameState.js';
import { DialogoManager } from '../utils/DialogoManager.js';

export class MapaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapaScene' });
    }


    //  Lifecycle

    init() {
        this.velocidadePlayer = 260;
        this.alcanceInteracao = 150;
        this._interagindo = false;    // true enquanto sub-cena está ativa
        this._objetosInterativos = [];
        this._msgTimer = null;
    }

    create() {
        this.dialogoMgr = new DialogoManager(this);

        // Limites físicos (abaixo do HUD)
        this.physics.world.setBounds(0, 68, 1920, 1012);

        // Construção do mundo
        this._criarFundo();
        this._criarPlayer();
        this._criarObstaculos();
        this._criarNPCs();
        this._criarObjetosInterativos();

        // Interface fixa
        this._criarHUD();
        this._criarCaixaMensagem();

        // Controles
        this._configurarTeclado();
        this._configurarMouse();

        // Listeners de eventos de sub-cenas
        this.events.on('dialogoEncerrado', this._aoTerminarDialogo, this);
        this.events.on('puzzleResolvido',   this._aoPuzzleResolvido,  this);

        // Ao retomar a cena (ex: fechar inventário/caderno), desbloquear interação
        this.events.on('resume', () => {
            this._interagindo = false;
        });

        // Câmera segue o player
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
        this.cameras.main.setDeadzone(200, 100);

        this._iniciarDia();
    }

    update() {
        if (this._interagindo) {
            this.player.body.setVelocity(0);
            return;
        }
        this._processarMovimento();
    }


    //  Construção do mundo

    _criarFundo() {
        // Base escura
        this.add.rectangle(960, 540, 1920, 1080, 0x0a0f1a);

        // Áreas visuais
        this._area(170,  542, 340,  950, 0x111d36, 'DELEGACIA');
        this._area(530,  542, 380,  950, 0x0e1928, 'ENTRADA');
        this._area(910,  390, 380,  620, 0x0d1526, 'SALA DE ESTAR');
        this._area(1300, 390, 400,  620, 0x0e120f, 'ESCRITÓRIO');
        this._area(1710, 390, 420,  620, 0x0c0e20, 'QUARTO');
        this._area(1310, 860, 1200, 335, 0x071a0e, 'JARDIM');

        // Separador horizontal jardim/salas
        this.add.rectangle(1310, 702, 1200, 5, 0x134e1c, 0.9);

        // Grade de textura
        this.add.grid(960, 540, 1920, 1080, 64, 64, 0, 0, 0x1e293b, 0.12);

        // Paredes decorativas entre delegacia e mansão
        this.add.rectangle(340, 542, 7, 950, 0x334155, 0.9);
    }

    _area(x, y, w, h, cor, label) {
        this.add.rectangle(x, y, w, h, cor);
        this.add.text(x, y - h / 2 + 22, label, {
            fontSize: '13px', fontFamily: "'Courier New', monospace",
            color: '#1e3a5f', letterSpacing: 3
        }).setOrigin(0.5);
    }

    _criarPlayer() {
        // Retângulo do jogador (policial)
        this.player = this.add.rectangle(170, 540, 28, 44, 0x6366f1).setDepth(10);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setSize(26, 42);

        // Indicador visual de direção / ícone
        this._playerIcon = this.add.text(170, 510, '👮', { fontSize: '22px' })
            .setOrigin(0.5).setDepth(11);
    }

    _criarObstaculos() {
        this._obstaculos = [];

        // Mesa delegacia (interativa como caderno)
        this._obst(170, 640, 160, 55, 0x6b3a00, 'MESA / CADERNO');

        // Sofá - sala de estar
        this._obst(960, 440, 190, 72, 0x3d2c1e);

        // Mesa escritório
        this._obst(1300, 490, 220, 58, 0x5c2d0a);

        // Cama quarto
        this._obst(1720, 270, 220, 105, 0x1e1b4b);

        // Arbustos / elementos de jardim
        this._obst(1200, 840, 80, 60, 0x134e1c);
        this._obst(1600, 900, 80, 60, 0x134e1c);

        // Colisão do player com obstáculos (após player criado)
        this._obstaculos.forEach(obs => this.physics.add.collider(this.player, obs));
    }

    _obst(x, y, w, h, cor, label) {
        const rect = this.add.rectangle(x, y, w, h, cor).setDepth(5);
        this.physics.add.existing(rect, true);
        if (label) {
            this.add.text(x, y, label, {
                fontSize: '11px', fontFamily: "'Courier New', monospace", color: '#fbbf24'
            }).setOrigin(0.5).setDepth(6);
        }
        this._obstaculos.push(rect);
        return rect;
    }

    _criarNPCs() {
        const npcsDef = [
            { id: 'ricardo', nome: 'Ricardo',  cor: 0xfbbf24, x: 490, y: 480, icon: '🧑‍🍳' },
            { id: 'elena',   nome: 'Elena',  cor: 0xd946ef, x: 890, y: 340, icon: '👩' },
            { id: 'marco',   nome: 'Marco',  cor: 0xef4444, x: 1700, y: 370, icon: null, sprite: 'npc-2' },
        ];

        this._npcs = [];

        npcsDef.forEach(def => {
            let npc;

            if (def.sprite) {
                // Usar sprite em vez de retângulo
                npc = this.add.image(def.x, def.y, def.sprite).setDepth(9);
                // Escala para manter proporção visual
                const targetH = 120;
                const scale = targetH / npc.height;
                npc.setScale(scale);
                this.physics.add.existing(npc, true);
                npc.body.setSize(30, 46);
                npc.body.setOffset(
                    (npc.width - 30 / scale) / 2,
                    (npc.height - 46 / scale) / 2
                );
            } else {
                // Retângulo colorido (padrão)
                npc = this.add.rectangle(def.x, def.y, 30, 46, def.cor, 0.9).setDepth(9);
                this.physics.add.existing(npc, true);
            }

            npc.setInteractive({ useHandCursor: true });
            npc.setData('tipo', 'npc');
            npc.setData('npcId', def.id);
            npc.setData('npcNome', def.nome);

            // Ícone (apenas se definido — sprites não precisam de emoji)
            if (def.icon) {
                this.add.text(def.x, def.y - 26, def.icon, { fontSize: '20px' })
                    .setOrigin(0.5).setDepth(10);
            }

            // Nome acima
            const nomeTag = this.add.text(def.x, def.y - 50, def.nome, {
                fontSize: '12px', fontFamily: "'Courier New', monospace",
                color: '#e2e8f0', backgroundColor: '#00000099', padding: { x: 5, y: 2 }
            }).setOrigin(0.5).setDepth(10).setAlpha(0.75);

            // Balão de interrogação pulsante
            const q = this.add.text(def.x + 18, def.y - 62, '?', {
                fontSize: '18px', fontFamily: 'Arial', color: '#fbbf24', fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(10);
            this.tweens.add({ targets: q, y: q.y - 6, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut' });

            // Efeitos de hover
            const baseScaleY = npc.scaleY; // guardar escala original
            npc.on('pointerover', () => {
                this.tweens.add({ targets: npc, scaleY: baseScaleY * 1.08, duration: 110 });
                nomeTag.setAlpha(1);
                this.input.setDefaultCursor('pointer');
            });
            npc.on('pointerout', () => {
                this.tweens.add({ targets: npc, scaleY: baseScaleY, duration: 110 });
                nomeTag.setAlpha(0.75);
                this.input.setDefaultCursor('default');
            });

            // Colisão com player
            this.physics.add.collider(this.player, npc);
            this._npcs.push({ rect: npc, def, q });
        });
    }

    _criarObjetosInterativos() {
        // Definição de todos os objetos clicáveis do mundo
        const objsDef = [
            // DIA 1
            {
                id: 'copo_whisky', nome: 'Copo de Whisky', x: 840, y: 570,
                w: 26, h: 26, cor: 0xfef3c7, diaMin: 1, tipo: 'pista',
                pistaId: 'copo_whisky',
                msg: '🔍  COPO DE WHISKY\n\nAnálise laboratorial detectou CIANETO DE POTÁSSIO.\nO veneno foi misturado à bebida da vítima.'
            },
            {
                id: 'carta_ameaca', nome: 'Carta de Ameaça', x: 1190, y: 420,
                w: 38, h: 28, cor: 0xfef9c3, diaMin: 1, tipo: 'pista',
                pistaId: 'carta_ameaca',
                msg: '🔍  CARTA DE AMEAÇA\n\n"Pague o que me deve ou você vai se arrepender muito.\n— M.F."\n\nIniciais M.F. → Marco Ferreira.'
            },
            {
                id: 'agenda_reuniao', nome: 'Agenda de Carlos', x: 1380, y: 475,
                w: 28, h: 36, cor: 0xfef9c3, diaMin: 1, tipo: 'pista',
                pistaId: 'agenda_reuniao',
                msg: '🔍  AGENDA DE CARLOS VILANOVA\n\nReunião: "M. Ferreira — assunto URGENTE — 19h30"\nData: dia do crime. Mesmo horário estimado da morte.'
            },
            // DIA 2 (computador = puzzle)
            {
                id: 'computador_carlos', nome: 'Computador', x: 555, y: 560,
                w: 62, h: 42, cor: 0x0e7490, diaMin: 2, tipo: 'puzzle',
                puzzleId: 'senha_computador', pistaId: 'extrato_bancario',
                msg: 'O computador de Carlos está ligado mas protegido por senha.'
            },
            {
                id: 'frasco_veneno', nome: 'Frasco de Cianeto', x: 1010, y: 855,
                w: 22, h: 34, cor: 0x86efac, diaMin: 2, tipo: 'pista',
                pistaId: 'frasco_veneno',
                msg: '🔍  FRASCO DE CIANETO DE POTÁSSIO\n\nEncontrado semi-enterrado perto do bar externo do jardim.\nImpressões digitais a analisar.'
            },
            // DIA 3
            {
                id: 'digital_marco', nome: 'Relatório Digital', x: 855, y: 490,
                w: 36, h: 28, cor: 0x6ee7b7, diaMin: 3, tipo: 'pista',
                pistaId: 'digital_marco',
                msg: '🔍  RELATÓRIO FORENSE — IMPRESSÕES DIGITAIS\n\nDigitais de MARCO FERREIRA no copo e na garrafa de whisky.\nEle estava na cena do crime.'
            },
            {
                id: 'nota_falsa', nome: 'Nota de Suicídio', x: 1620, y: 460,
                w: 40, h: 32, cor: 0xfef9c3, diaMin: 3, tipo: 'pista',
                pistaId: 'nota_falsa',
                msg: '🔍  NOTA DE SUICÍDIO FALSA\n\nNota digitada em máquina — Carlos sempre escrevia à mão (canhoto).\nAlguém tentou desviar suspeitas para Elena.'
            },
        ];

        this._objetosInterativos = [];

        objsDef.forEach(def => {
            const rect = this.add.rectangle(def.x, def.y, def.w, def.h, def.cor).setDepth(7);
            rect.setData('objDef', def);

            // Glow pulsante
            const glow = this.add.rectangle(def.x, def.y, def.w + 10, def.h + 10, def.cor, 0)
                .setStrokeStyle(2, def.cor, 0.5).setDepth(6);
            this.tweens.add({ targets: glow, alpha: 0.8, yoyo: true, repeat: -1, duration: 1100, ease: 'Sine.easeInOut' });

            // Label
            const lbl = this.add.text(def.x, def.y - def.h / 2 - 13, def.nome, {
                fontSize: '11px', fontFamily: "'Courier New', monospace",
                color: '#e2e8f0', backgroundColor: '#00000099', padding: { x: 4, y: 1 }
            }).setOrigin(0.5).setDepth(8);

            // Interatividade
            rect.setInteractive({ useHandCursor: true });
            rect.on('pointerover', () => {
                rect.setFillStyle(0xffffff);
                this.input.setDefaultCursor('pointer');
            });
            rect.on('pointerout', () => {
                rect.setFillStyle(def.cor);
                this.input.setDefaultCursor('default');
            });

            this._objetosInterativos.push({ rect, glow, lbl, def });

            // Ocultar se ainda não disponível no dia atual
            if (def.diaMin > GameState.diaAtual) {
                rect.setVisible(false);
                glow.setVisible(false);
                lbl.setVisible(false);
            }

            // Dimmer se já coletado
            if (def.tipo === 'pista' && GameState.temPista(def.pistaId)) {
                rect.setAlpha(0.4);
            }
        });
    }


    //  HUD (fixo na câmera)

    _criarHUD() {
        const depth = 200;

        // Faixa do HUD
        this.add.rectangle(960, 34, 1920, 68, 0x070c14, 0.97)
            .setScrollFactor(0).setDepth(depth);
        this.add.rectangle(960, 68, 1920, 2, 0x334155, 0.8)
            .setScrollFactor(0).setDepth(depth);

        // Logo / título
        this.add.text(22, 34, '◆  AINDA À ESPERA', {
            fontSize: '18px', fontFamily: "'Courier New', monospace", color: '#6366f1', fontStyle: 'bold'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(depth);

        // Dados dinâmicos
        this._hudDia   = this._hudTxt(430, 34, '', depth);
        this._hudHora  = this._hudTxt(640, 34, '', depth, '#94a3b8');
        this._hudAcoes = this._hudTxt(850, 34, '', depth, '#fbbf24');

        // Botões fixos
        this._criarBotaoHUD(1820, 34, '[ I ] 🎒 INVENTÁRIO', depth, () => this._abrirInventario());
        this._criarBotaoHUD(1620, 34, '[ N ] ✏️ CADERNO',   depth, () => this._abrirCaderno());

        // Botão julgamento (aparece no dia 3)
        this._btnJulgamentoHUD = this._criarBotaoHUD(1430, 34, '[ J ] ⚖️ JULGAMENTO', depth, () => this._irJulgamento(), '#ef4444');
        this._btnJulgamentoHUD.setVisible(GameState.diaAtual >= GameState.maxDias);

        this._atualizarHUD();
    }

    _hudTxt(x, y, txt, depth, cor = '#e2e8f0') {
        return this.add.text(x, y, txt, {
            fontSize: '15px', fontFamily: "'Courier New', monospace", color: cor
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(depth);
    }

    _criarBotaoHUD(x, y, label, depth, cb, corNormal = '#64748b') {
        const txt = this.add.text(x, y, label, {
            fontSize: '13px', fontFamily: "'Courier New', monospace", color: corNormal
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth).setInteractive({ useHandCursor: true });
        txt.on('pointerover', () => txt.setColor('#f8fafc'));
        txt.on('pointerout', () => txt.setColor(corNormal));
        txt.on('pointerdown', () => cb());
        return txt;
    }

    _atualizarHUD() {
        this._hudDia.setText(`DIA ${GameState.diaAtual} / ${GameState.maxDias}`);
        this._hudHora.setText(`⏰  ${GameState.getHoraFormatada()}`);
        const ac = GameState.getAcoesRestantes();
        this._hudAcoes.setText(`⚡  ${ac} ${ac !== 1 ? 'AÇÕES' : 'AÇÃO'} RESTANTE${ac !== 1 ? 'S' : ''}`);
        if (this._btnJulgamentoHUD) {
            this._btnJulgamentoHUD.setVisible(GameState.diaAtual >= GameState.maxDias);
        }
    }

    //  Caixa de mensagem inline

    _criarCaixaMensagem() {
        this._msgBg = this.add.rectangle(960, 1020, 1800, 110, 0x050c18, 0)
            .setScrollFactor(0).setDepth(190)
            .setStrokeStyle(1, 0x334155, 0);
        this._msgTxt = this.add.text(960, 1020, '', {
            fontSize: '17px', fontFamily: "'Courier New', monospace",
            color: '#e2e8f0', wordWrap: { width: 1760 }, align: 'center', lineSpacing: 5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(191).setAlpha(0);
    }

    mostrarMensagem(texto, duracao = 4500) {
        if (this._msgTimer) this._msgTimer.remove();
        this._msgTxt.setText(texto);
        this._msgBg.setFillStyle(0x050c18, 0.96);
        this._msgBg.setStrokeStyle(1, 0x334155, 0.8);
        this.tweens.killTweensOf([this._msgBg, this._msgTxt]);
        this.tweens.add({ targets: [this._msgBg, this._msgTxt], alpha: 1, duration: 200 });
        this._msgTimer = this.time.delayedCall(duracao, () => {
            this.tweens.add({ targets: [this._msgBg, this._msgTxt], alpha: 0, duration: 400 });
        });
    }


    //  Controles

    _configurarTeclado() {
        this._keys = this.input.keyboard.createCursorKeys();
        this._wasd = this.input.keyboard.addKeys({
            up:    Phaser.Input.Keyboard.KeyCodes.W,
            down:  Phaser.Input.Keyboard.KeyCodes.S,
            left:  Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', () => {
            if (this._interagindo) return;
            if (!GameState.podeAgir()) {
                this.mostrarMensagem('Você não pode mais agir hoje. Aguarde o fim do dia.', 2500);
                return;
            }
              // Procura o NPC mais próximo dentro do alcance
            let alvoNPC = null;
            let menorDistNPC = this.alcanceInteracao;
            for (const { rect } of this._npcs) {
                const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, rect.x, rect.y);
                if (d <= menorDistNPC) { menorDistNPC = d; alvoNPC = rect; }
            }
            // Procura o objeto interativo mais próximo dentro do alcance
            let alvoObj = null;
            let alvoObjDef = null;
            let menorDistObj = this.alcanceInteracao * 1.6;
            for (const { rect, def } of this._objetosInterativos) {
                if (!rect.visible) continue;
                const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, rect.x, rect.y);
                if (d <= menorDistObj) { menorDistObj = d; alvoObj = rect; alvoObjDef = def; }
            }
            
            if (alvoNPC) {
                this._interagirNPC(alvoNPC);
            } else if (alvoObj && alvoObjDef) {
                this._interagirObjeto(alvoObj, alvoObjDef);
            }
        });
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I).on('down', () => this._abrirInventario());
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N).on('down', () => this._abrirCaderno());
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J).on('down', () => {
            if (GameState.diaAtual >= GameState.maxDias) this._irJulgamento();
        });
    }

    _configurarMouse() {
        this.input.on('pointerdown', (pointer, gameObjects) => {
            if (this._interagindo) return;
            if (gameObjects.length === 0) return;
            const obj = gameObjects[0];
            const tipo = obj.getData('tipo');
            const objDef = obj.getData('objDef');

            if (tipo === 'npc')   
                this._interagirNPC(obj);
            else if (objDef) {
                if (!GameState.podeAgir()) {
                    this.mostrarMensagem('Você não pode mais agir hoje. Aguarde o fim do dia.', 2500);
                    return;
                }
                this._interagirObjeto(obj, objDef);
            }
        });
    }


    //  Movimentação

    _processarMovimento() {
        const vel = this.velocidadePlayer;
        let vx = 0, vy = 0;

        if (this._keys.left.isDown  || this._wasd.left.isDown)  vx = -vel;
        else if (this._keys.right.isDown || this._wasd.right.isDown) vx = vel;
        if (this._keys.up.isDown    || this._wasd.up.isDown)    vy = -vel;
        else if (this._keys.down.isDown  || this._wasd.down.isDown)  vy = vel;

        // Normaliza diagonal
        if (vx !== 0 && vy !== 0) { vx *= 0.7071; vy *= 0.7071; }

        this.player.body.setVelocity(vx, vy);
        this._playerIcon.setPosition(this.player.x, this.player.y - 28);
    }


    //  Interações com NPC

    _interagirNPC(npcRect) {
        const npcId   = npcRect.getData('npcId');
        const npcNome = npcRect.getData('npcNome');
        const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y, npcRect.x, npcRect.y
        );

        if (dist > this.alcanceInteracao) {
            this.mostrarMensagem(`Muito longe. Aproxime-se de ${npcNome} para conversar.`, 2500);
            return;
        }
        if (!GameState.podeAgir()) {
            this.mostrarMensagem('Você não pode mais agir hoje. Aguarde o fim do dia.', 2500);
            return;
        }
        if (GameState.jaDinterrogadoHoje(npcId)) {
            this.mostrarMensagem(`${npcNome} já foi interrogado hoje. Volte amanhã.`, 2500);
            return;
        }

        const falas = this.dialogoMgr.getFalas(npcId, GameState.diaAtual);
        this._interagindo = true;
        this.scene.launch('DialogueScene', { npcId, npcNome, falas });
        this.scene.pause('MapaScene');
    }


    //  Interações com objetos

    _interagirObjeto(rect, def) {
        const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y, rect.x, rect.y
        );
        const alcance = this.alcanceInteracao * 1.6;

        if (dist > alcance) {
            this.mostrarMensagem(`Muito longe. Aproxime-se de "${def.nome}" para examinar.`, 2500);
            return;
        }
        if (def.diaMin > GameState.diaAtual) {
            this.mostrarMensagem('Nada de interessante aqui por enquanto.', 2000);
            return;
        }
        if (!GameState.podeAgir()) {
            this.mostrarMensagem('Você não pode mais agir hoje. Aguarde o fim do dia.', 2500);
            return;
        }

        if (def.tipo === 'puzzle') {
            if (GameState.temPista(def.pistaId)) {
                this.mostrarMensagem(`Já coletei as informações deste item.`, 2000);
            } else {
                this._interagindo = true;
                this.scene.launch('PuzzleScene', {
                    puzzleId: def.puzzleId,
                    pistasDados: this.dialogoMgr.getPuzzleDados(def.puzzleId)
                });
                this.scene.pause('MapaScene');
            }
            return;
        }

        // Pista comum
        if (GameState.temPista(def.pistaId)) {
            this.mostrarMensagem(`Já anotei isso no caderno.\n${def.msg}`, 3500);
            return;
        }

        // Coleta a pista
        GameState.anotarPista(def.pistaId);
        this.mostrarMensagem(def.msg, 5500);

        // Feedback visual: pisca + escurece o objeto
        this.tweens.add({
            targets: rect, alpha: 0, yoyo: true, repeat: 2, duration: 140,
            onComplete: () => rect.setAlpha(0.35)
        });

        // Notificação flutuante
        this._notificacaoPista(rect.x, rect.y);

        // Gasta ação
        const fimDia = GameState.gastarAcao();
        this._atualizarHUD();
        if (fimDia) this.time.delayedCall(5800, () => this._fimDoDia());
    }

    _notificacaoPista(x, y) {
        const n = this.add.text(x, y - 55, '★  PISTA ANOTADA!', {
            fontSize: '15px', fontFamily: "'Courier New', monospace",
            color: '#fbbf24', fontStyle: 'bold',
            backgroundColor: '#00000099', padding: { x: 6, y: 2 }
        }).setOrigin(0.5).setDepth(50);
        this.tweens.add({ targets: n, y: y - 95, alpha: 0, duration: 1600, onComplete: () => n.destroy() });
    }


    //  Inventário / Caderno

    _abrirInventario() {
        if (this._interagindo) return;
        this._interagindo = true;
        this.scene.launch('InventoryScene', { abaInicial: 'inventario' });
        this.scene.pause('MapaScene');
    }

    _abrirCaderno() {
        if (this._interagindo) return;
        this._interagindo = true;
        this.scene.launch('InventoryScene', { abaInicial: 'caderno' });
        this.scene.pause('MapaScene');
    }


    //  Callbacks de sub-cenas

    _aoTerminarDialogo(npcId) {
        this._interagindo = false;
        GameState.registrarInterrogatorio(npcId);
        const nomeNPC = this.dialogoMgr.getNomeNPC(npcId);

        // Esconder o ponto de interrogação do NPC
        const npcEntry = this._npcs.find(n => n.def.id === npcId);
        if (npcEntry && npcEntry.q) {
            npcEntry.q.setVisible(false);
        }

        // Registrar ponto-chave do interrogatório no caderno
        const pontoChave = this.dialogoMgr.getPontoChave(npcId, GameState.diaAtual);
        if (pontoChave) {
            GameState.registrarAnotacaoInterrogatorio(npcId, nomeNPC, GameState.diaAtual, pontoChave);
        }

        const fimDia = GameState.gastarAcao();
        this._atualizarHUD();
        this.mostrarMensagem(`Interrogatório de ${nomeNPC} concluído.\nInformações anotadas no caderno.`, 3500);
        if (fimDia) this.time.delayedCall(4000, () => this._fimDoDia());
    }

    _aoPuzzleResolvido(dados) {
        this._interagindo = false;
        if (dados.recompensaId) GameState.anotarPista(dados.recompensaId);
        const fimDia = GameState.gastarAcao();
        this._atualizarHUD();
        this.mostrarMensagem(dados.mensagem || '🔍 Puzzle resolvido! Nova pista anotada.', 5000);
        // Dimmer objeto do puzzle
        const objEntry = this._objetosInterativos.find(e => e.def.tipo === 'puzzle' && e.def.pistaId === dados.recompensaId);
        if (objEntry) objEntry.rect.setAlpha(0.35);
        this._notificacaoPista(this.player.x, this.player.y - 30);
        if (fimDia) this.time.delayedCall(5200, () => this._fimDoDia());
    }

    //  Início de dia / Fim de dia

    _iniciarDia() {
        // Atualizar visibilidade dos objetos
        this._objetosInterativos.forEach(({ rect, glow, lbl, def }) => {
            const vis = def.diaMin <= GameState.diaAtual;
            rect.setVisible(vis);
            glow.setVisible(vis);
            lbl.setVisible(vis);
            if (vis && def.tipo === 'pista' && GameState.temPista(def.pistaId)) {
                rect.setAlpha(0.35);
            }
        });

        // Mostrar botão julgamento no dia 3
        if (this._btnJulgamentoHUD) {
            this._btnJulgamentoHUD.setVisible(GameState.diaAtual >= GameState.maxDias);
        }

        // Atualizar pontos de interrogação dos NPCs
        this._npcs.forEach(n => {
            if (n.q) {
                const jaInterrogado = GameState.jaDinterrogadoHoje(n.def.id);
                n.q.setVisible(!jaInterrogado);
            }
        });

        // Fade in
        this.cameras.main.fadeIn(900, 0, 0, 0);

        // Mensagem de início do dia
        const msgs = {
            1: 'DIA 1 — A investigação começa.\nExamine a mansão e interrogue os suspeitos.\nUse SETAS / WASD para mover. CLIQUE nos objetos e NPCs para interagir.',
            2: 'DIA 2 — Novas pistas disponíveis.\nHá novos objetos para examinar no jardim e na entrada.\nO computador de Carlos pode guardar segredos importantes.',
            3: 'DIA FINAL — Última chance.\nUse todas as pistas coletadas. Pressione J ou o botão no HUD\npara abrir o Dia do Julgamento quando estiver pronto.'
        };
        this.time.delayedCall(700, () => {
            this.mostrarMensagem(msgs[GameState.diaAtual] || '', 6000);
        });

        this._atualizarHUD();

        // Volta o player para a delegacia ao iniciar novo dia
        if (GameState.diaAtual > 1) {
            this.player.setPosition(170, 540);
            this._playerIcon.setPosition(170, 512);
        }
    }

    _fimDoDia() {
        if (GameState.diaAtual >= GameState.maxDias) {
            // No último dia → julgamento
            this._irJulgamento();
            return;
        }
        this.mostrarMensagem('Fim do dia. Voltando para a delegacia...', 2200);
        this.time.delayedCall(2400, () => {
            this.cameras.main.fadeOut(1200, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                GameState.avancarDia();
                this._iniciarDia();
            });
        });
    }

    _irJulgamento() {
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('JulgamentoScene');
        });
    }
}
