/**
 * CasaAmigaScene — Cena 02: A Casa da Amiga (Exploração e Interrogatório)
 *
 * Ambiente: Sala de estar da casa da amiga. Clima melancólico e tenso.
 * O jogador explora a sala, encontra a mochila da vítima (desbloqueando o diálogo),
 * interroga a amiga e recebe a próxima pista: investigar a lanchonete.
 *
 * Fluxo:
 *   1. Exploração livre → clicar na amiga = bloqueio
 *   2. Encontrar mochila → popup com pista → GUARDAR
 *   3. Interrogar amiga (diálogo Stardew Valley)
 *   4. Popup de missão → VAMOS → porta destacada → Fade Out → próxima cena
 */
import { GameState } from '../utils/GameState.js';

// Dados de diálogo embutidos (espelho do JSON fornecido)
const DIALOGO_CENA02 = [
    {
        ator: 'Policial',
        fala: 'Encontrei a mochila dela ali no canto com esta foto e este bilhete. Ela costumava esquecer as coisas assim?'
    },
    {
        ator: 'Amiga',
        fala: 'A culpa é toda minha... Ela veio aqui ontem exausta. O parceiro dela controla tudo: o dinheiro, as roupas, as amizades.'
    },
    {
        ator: 'Policial',
        fala: 'O que aconteceu entre vocês duas na noite passada?'
    },
    {
        ator: 'Amiga',
        fala: 'Eu fui negligente e perdi a paciência. Mandei ela simplesmente largar ele. Ela se sentiu julgada, defendeu ele e nós brigamos. Ela saiu correndo e deixou tudo pra trás... Eu devia ter acolhido, não julgado.'
    },
    {
        ator: 'Policial',
        fala: 'Este bilhete fala sobre \'o jeito que ele olha na casa deles\'. Você sabe o que significa?'
    },
    {
        ator: 'Amiga',
        fala: 'Deve ser o companheiro. Eles moram muito perto da família dele. Sei que depois daqui, o turno dela ia começar. Ela deve ter ido direto para a lanchonete onde trabalha.'
    }
];

const TEXTO_BLOQUEIO = 'Me desculpe, policial... as coisas dela estão ali no canto, eu não consigo parar de chorar para falar agora.';
const TEXTO_MOCHILA  = "Você encontrou uma foto da vítima e um bilhete amassado com os dizeres: 'Não aguento mais o jeito que ele me olha quando estou na casa deles'.";


export class Cena2Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Cena2Scene' });
    }

    init() {
        this.velocidadePlayer = 260;
        this._fase = 'exploracao';   // 'exploracao' | 'popup_mochila' | 'dialogo' | 'missao' | 'saida' | 'transicao'
        this._mochilaEncontrada = false;
        this._dialogoConcluido = false;
        this._dialogoIndex = 0;
    }

    create() {
        const { width, height } = this.scale;

        // Construir ambiente
        this._criarSalaDeEstar(width, height);
        this._criarMobilia(width, height);
        this._criarNPCAmiga(width, height);
        this._criarMochila(width, height);
        this._criarPortaSaida(width, height);
        this._criarPlayer(width, height);
        this._criarUIInstrucao(width, height);
        this._configurarControles();

        // Fade in
        this.cameras.main.fadeIn(900, 0, 0, 0);
    }

    update() {
        // Travar player em estados de UI
        if (this._fase === 'popup_mochila' || this._fase === 'dialogo' || this._fase === 'missao' || this._fase === 'transicao') {
            this.player.body.setVelocity(0);
            return;
        }

        this._processarMovimento();

        // Manter ícone do player sincronizado
        if (this._playerIcon) {
            this._playerIcon.setPosition(this.player.x, this.player.y - 28);
        }
    }


    _criarSalaDeEstar(w, h) {
        // Chão — madeira escura
        this.add.rectangle(w / 2, h / 2, w, h, 0x1a1208);

        // Textura de tábuas de madeira (grade horizontal)
        for (let y = 0; y < h; y += 48) {
            this.add.rectangle(w / 2, y, w, 1, 0x2a1f10, 0.15);
        }

        // Grade sutil
        this.add.grid(w / 2, h / 2, w, h, 96, 48, 0, 0, 0x2a1f10, 0.06);

        // Paredes — tom cinza azulado melancólico
        this.add.rectangle(w / 2, 70, w, 140, 0x141c2e);                 // parede superior
        this.add.rectangle(w / 2, 140, w, 3, 0x2a3454, 0.7);            // rodapé superior
        this.add.rectangle(40, h / 2, 80, h, 0x141c2e);                  // parede esquerda
        this.add.rectangle(80, h / 2, 3, h, 0x2a3454, 0.4);              // rodapé esquerda
        this.add.rectangle(w - 40, h / 2, 80, h, 0x141c2e);              // parede direita
        this.add.rectangle(w - 80, h / 2, 3, h, 0x2a3454, 0.4);          // rodapé direita
        this.add.rectangle(w / 2, h - 30, w, 60, 0x0e0a04);              // rodapé inferior

        // Label da cena (sutil)
        this.add.text(w / 2, 60, 'CASA DA AMIGA', {
            fontSize: '14px', fontFamily: "'Courier New', monospace",
            color: '#2a3454', letterSpacing: 6
        }).setOrigin(0.5);

        // Overlay de atmosfera melancólica — vinheta sutil
        const vinheta = this.add.rectangle(w / 2, h / 2, w, h, 0x0a0a1a, 0.2).setDepth(0);
        // Animação de "respiração" da luz (muito sutil)
        this.tweens.add({
            targets: vinheta,
            alpha: 0.35, yoyo: true, repeat: -1, duration: 4000, ease: 'Sine.easeInOut'
        });

        // Colisão com paredes
        this._paredeTop = this.add.rectangle(w / 2, 140, w, 5, 0x000000, 0).setDepth(0);
        this.physics.add.existing(this._paredeTop, true);
        this._paredeLeft = this.add.rectangle(80, h / 2, 5, h, 0x000000, 0).setDepth(0);
        this.physics.add.existing(this._paredeLeft, true);
        this._paredeRight = this.add.rectangle(w - 80, h / 2, 5, h, 0x000000, 0).setDepth(0);
        this.physics.add.existing(this._paredeRight, true);
        this._paredeBottom = this.add.rectangle(w / 2, h - 60, w, 5, 0x000000, 0).setDepth(0);
        this.physics.add.existing(this._paredeBottom, true);
    }

    _criarMobilia(w, h) {
        // Sofá (centro-esquerda)
        const sofaX = 460, sofaY = 400;
        const sofa = this.add.rectangle(sofaX, sofaY, 220, 80, 0x2d1a3a).setDepth(3);
        sofa.setStrokeStyle(1, 0x4a2d5e);
        this.physics.add.existing(sofa, true);
        this._sofaBody = sofa;
        // Almofadas no sofá
        this.add.rectangle(sofaX - 60, sofaY - 5, 55, 40, 0x3d2a4e, 0.7).setDepth(4);
        this.add.rectangle(sofaX + 60, sofaY - 5, 55, 40, 0x3d2a4e, 0.7).setDepth(4);
        // Encosto
        this.add.rectangle(sofaX, sofaY - 42, 220, 10, 0x231030).setDepth(3);

        // Mesa de centro
        const mesaX = 460, mesaY = 530;
        const mesaCentro = this.add.rectangle(mesaX, mesaY, 150, 60, 0x3d2a1a).setDepth(4);
        mesaCentro.setStrokeStyle(1, 0x5c3d20);
        this.physics.add.existing(mesaCentro, true);
        this._mesaCentroBody = mesaCentro;
        // Caneca na mesa
        this.add.text(mesaX + 40, mesaY - 5, '☕', { fontSize: '18px' }).setOrigin(0.5).setDepth(5);
        // Lenços amassados (detalhes melancólicos)
        this.add.rectangle(mesaX - 30, mesaY + 5, 18, 14, 0xf0f0f0, 0.4).setDepth(5).setAngle(15);
        this.add.rectangle(mesaX - 15, mesaY - 8, 16, 12, 0xf0f0f0, 0.3).setDepth(5).setAngle(-10);

        // Estante de livros (parede esquerda)
        const estanteX = 140, estanteY = 350;
        const estante = this.add.rectangle(estanteX, estanteY, 80, 260, 0x2a1e12).setDepth(2);
        estante.setStrokeStyle(1, 0x3d2a1a);
        this.physics.add.existing(estante, true);
        this._estanteBody = estante;
        // Livros coloridos
        const corLivros = [0x6366f1, 0xef4444, 0x22c55e, 0xfbbf24, 0xa855f7, 0x06b6d4];
        for (let i = 0; i < 6; i++) {
            const lx = estanteX - 20 + (i % 3) * 22;
            const ly = estanteY - 90 + Math.floor(i / 3) * 80;
            this.add.rectangle(lx, ly, 18, 50, corLivros[i], 0.6).setDepth(3);
        }
        // Emoji de livros
        this.add.text(estanteX, estanteY + 80, '📚', { fontSize: '24px' }).setOrigin(0.5).setDepth(3);

        // Abajur (canto superior direito)
        const abajurX = 1600, abajurY = 280;
        this.add.rectangle(abajurX, abajurY + 30, 12, 60, 0x3d2a1a).setDepth(2); // haste
        this.add.rectangle(abajurX, abajurY, 50, 35, 0xfbbf24, 0.15).setDepth(3); // cúpula
        this.add.text(abajurX, abajurY - 5, '💡', { fontSize: '22px' }).setOrigin(0.5).setDepth(4);
        // Glow do abajur
        const abajurGlow = this.add.circle(abajurX, abajurY + 10, 80, 0xfbbf24, 0.04).setDepth(1);
        this.tweens.add({
            targets: abajurGlow,
            alpha: 0.08, yoyo: true, repeat: -1, duration: 3000, ease: 'Sine.easeInOut'
        });

        // Quadro na parede (melancólico)
        const quadroX = 700, quadroY = 105;
        const quadro = this.add.rectangle(quadroX, quadroY, 130, 60, 0x1a1e2e);
        quadro.setStrokeStyle(2, 0x3d4a6a);
        this.add.text(quadroX, quadroY, '🌧️ Dias Cinzentos', {
            fontSize: '11px', fontFamily: "'Courier New', monospace", color: '#4a5568'
        }).setOrigin(0.5);

        // Quadro de fotos (parede direita)
        const fotoQuadroX = 1100, fotoQuadroY = 105;
        const fotoQuadro = this.add.rectangle(fotoQuadroX, fotoQuadroY, 100, 70, 0x1e1e2a);
        fotoQuadro.setStrokeStyle(2, 0x4a3d6a);
        this.add.text(fotoQuadroX, fotoQuadroY, '📷', { fontSize: '24px' }).setOrigin(0.5);

        // Tapete (centro)
        const tapete = this.add.ellipse(w / 2, h / 2 + 60, 500, 250, 0x2a1a3a, 0.15).setDepth(0);
        tapete.setStrokeStyle(1, 0x3d2a4e, 0.2);

        // TV desligada (parede superior, centro)
        const tvX = 960, tvY = 105;
        const tv = this.add.rectangle(tvX, tvY, 160, 70, 0x0a0a0a);
        tv.setStrokeStyle(2, 0x1e1e2e);
        this.add.rectangle(tvX, tvY, 150, 60, 0x111122, 0.8); // tela
        this.add.text(tvX, tvY, '📺', { fontSize: '14px', color: '#1e1e2e' }).setOrigin(0.5);

        // Planta no canto
        this.add.text(1750, 220, '🪴', { fontSize: '30px' }).setOrigin(0.5).setDepth(3);

        // Janela com cortina (parede superior esquerda)
        const janelaX = 320, janelaY = 90;
        this.add.rectangle(janelaX, janelaY, 100, 70, 0x1a2a3a);
        this.add.rectangle(janelaX, janelaY, 90, 60, 0x1e3040, 0.6); // vidro
        this.add.rectangle(janelaX, janelaY, 2, 60, 0x2a3454, 0.8);  // travessa vertical
        this.add.rectangle(janelaX, janelaY, 90, 2, 0x2a3454, 0.8);  // travessa horizontal
        // Cortinas
        this.add.rectangle(janelaX - 50, janelaY, 15, 75, 0x2d1a3a, 0.7);
        this.add.rectangle(janelaX + 50, janelaY, 15, 75, 0x2d1a3a, 0.7);
    }


    _criarNPCAmiga(w, h) {
        // Posição: canto superior direito, perto do sofá
        this._amigaX = 1200;
        this._amigaY = 500;

        // Corpo
        this._amiga = this.add.rectangle(this._amigaX, this._amigaY, 28, 44, 0xa855f7).setDepth(10);
        this._amiga.setStrokeStyle(1, 0xc084fc);
        this._amiga.setInteractive({ useHandCursor: true });

        // Ícone
        this._amigaIcon = this.add.text(this._amigaX, this._amigaY - 28, '😢', { fontSize: '22px' })
            .setOrigin(0.5).setDepth(11);

        // Label "Amiga"
        this._amigaLabel = this.add.text(this._amigaX, this._amigaY + 35, 'AMIGA', {
            fontSize: '11px', fontFamily: "'Courier New', monospace",
            color: '#a855f7', backgroundColor: '#0a0a1a99', padding: { x: 4, y: 2 }
        }).setOrigin(0.5).setDepth(11);

        // Animação de nervosismo (tremor leve)
        this.tweens.add({
            targets: [this._amiga, this._amigaIcon, this._amigaLabel],
            x: this._amigaX + 2,
            yoyo: true, repeat: -1, duration: 150, ease: 'Sine.easeInOut'
        });

        // Partículas de lágrimas (emojis caindo sutilmente)
        this._criarLagrimasAmiga();

        // Clique na amiga
        this._amiga.on('pointerdown', () => this._interagirAmiga());
    }

    _criarLagrimasAmiga() {
        // Pequenos pontos azuis caindo periodicamente
        this.time.addEvent({
            delay: 1800,
            loop: true,
            callback: () => {
                if (this._fase === 'dialogo' || this._fase === 'transicao') return;
                const lagrima = this.add.circle(
                    this._amigaX + Phaser.Math.Between(-5, 5),
                    this._amigaY - 15,
                    2, 0x60a5fa, 0.7
                ).setDepth(12);
                this.tweens.add({
                    targets: lagrima,
                    y: this._amigaY + 20,
                    alpha: 0, duration: 1000,
                    onComplete: () => lagrima.destroy()
                });
            }
        });
    }

    _criarMochila(w, h) {
        // Posição: canto inferior esquerdo da sala
        this._mochilaX = 250;
        this._mochilaY = 750;

        // Corpo da mochila
        this._mochila = this.add.rectangle(this._mochilaX, this._mochilaY, 36, 42, 0x92400e).setDepth(6);
        this._mochila.setStrokeStyle(1, 0xb45309);
        this._mochila.setInteractive({ useHandCursor: true });

        // Detalhe: alça
        this.add.rectangle(this._mochilaX, this._mochilaY - 24, 20, 6, 0x78350b).setDepth(7);

        // Ícone da mochila
        this._mochilaIcon = this.add.text(this._mochilaX, this._mochilaY, '🎒', { fontSize: '24px' })
            .setOrigin(0.5).setDepth(7);

        // Glow ao hover (inicialmente invisível)
        this._mochilaGlow = this.add.rectangle(this._mochilaX, this._mochilaY, 52, 58, 0xfbbf24, 0)
            .setStrokeStyle(2, 0xfbbf24, 0).setDepth(5);

        // Eventos de hover
        this._mochila.on('pointerover', () => {
            if (this._mochilaEncontrada) return;
            this._mochilaGlow.setStrokeStyle(2, 0xfbbf24, 0.7);
            this.tweens.add({
                targets: this._mochilaGlow,
                alpha: 0.8, duration: 200
            });
        });
        this._mochila.on('pointerout', () => {
            this.tweens.add({
                targets: this._mochilaGlow,
                alpha: 0, duration: 200,
                onComplete: () => this._mochilaGlow.setStrokeStyle(2, 0xfbbf24, 0)
            });
        });

        // Clique na mochila
        this._mochila.on('pointerdown', () => this._interagirMochila());

        // Brilho pulsante sutil para atrair atenção
        this._mochilaPulse = this.add.circle(this._mochilaX, this._mochilaY, 30, 0xfbbf24, 0).setDepth(4);
        this.tweens.add({
            targets: this._mochilaPulse,
            alpha: 0.12, scaleX: 1.5, scaleY: 1.5,
            yoyo: true, repeat: -1, duration: 1500, ease: 'Sine.easeInOut'
        });
    }


    _criarPortaSaida(w, h) {
        // Porta na parede esquerda (inferior)
        this._portaX = 80;
        this._portaY = h / 2 + 100;

        this._porta = this.add.rectangle(this._portaX, this._portaY, 20, 110, 0x3d2a1a).setDepth(4);
        this._porta.setStrokeStyle(1, 0x5c3d20);

        // Maçaneta
        this.add.circle(this._portaX + 6, this._portaY, 4, 0xc9a96e).setDepth(5);

        // Label
        this._portaLabel = this.add.text(this._portaX + 20, this._portaY, 'SAÍDA', {
            fontSize: '11px', fontFamily: "'Courier New', monospace",
            color: '#3d4a6a', backgroundColor: '#00000099', padding: { x: 4, y: 2 }
        }).setOrigin(0, 0.5).setDepth(5).setAlpha(0.4);

        // Highlight (desativado até missão ser concluída)
        this._portaHighlight = this.add.rectangle(this._portaX, this._portaY, 30, 120, 0xfbbf24, 0)
            .setStrokeStyle(3, 0xfbbf24, 0).setDepth(3);

        // Zona de trigger (physics)
        this._portaZona = this.add.rectangle(this._portaX, this._portaY, 50, 120, 0x000000, 0).setDepth(0);
        this.physics.add.existing(this._portaZona, true);
    }

    _criarPlayer(w, h) {
        // Player inicia no centro-inferior
        const startX = w / 2;
        const startY = h - 180;

        this.player = this.add.rectangle(startX, startY, 28, 44, 0x6366f1).setDepth(10);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setSize(26, 42);

        // Ícone
        this._playerIcon = this.add.text(startX, startY - 28, '👮', { fontSize: '22px' })
            .setOrigin(0.5).setDepth(11);

        // Colisões com paredes
        this.physics.add.collider(this.player, this._paredeTop);
        this.physics.add.collider(this.player, this._paredeLeft);
        this.physics.add.collider(this.player, this._paredeRight);
        this.physics.add.collider(this.player, this._paredeBottom);

        // Colisões com mobília
        this.physics.add.collider(this.player, this._sofaBody);
        this.physics.add.collider(this.player, this._mesaCentroBody);
        this.physics.add.collider(this.player, this._estanteBody);
    }


    _criarUIInstrucao(w, h) {
        this._instrBg = this.add.rectangle(w / 2, h - 100, 750, 50, 0x050c18, 0.9).setDepth(100);
        this._instrBg.setStrokeStyle(1, 0x6366f1, 0.5);

        this._instrText = this.add.text(w / 2, h - 100,
            'Vasculhe a sala e encontre pistas sobre a vítima', {
                fontSize: '16px', fontFamily: "'Courier New', monospace",
                color: '#cbd5e1', align: 'center'
            }).setOrigin(0.5).setDepth(101);

        // Fade in
        this._instrBg.setAlpha(0);
        this._instrText.setAlpha(0);
        this.tweens.add({ targets: [this._instrBg, this._instrText], alpha: 1, duration: 800, delay: 600 });
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
            if (this._fase === 'dialogo') this._avancarDialogo();
            else if (this._fase === 'missao') this._aoClicarVamos();
            else if (this._fase === 'popup_mochila') this._aoClicarGuardar();
            else if (this._fase === 'exploracao') this._interagirPorProximidade();
        });
    }

    _processarMovimento() {
        const vel = this.velocidadePlayer;
        let vx = 0, vy = 0;

        if (this._keys.left.isDown  || this._wasd.left.isDown)  vx = -vel;
        else if (this._keys.right.isDown || this._wasd.right.isDown) vx = vel;
        if (this._keys.up.isDown    || this._wasd.up.isDown)    vy = -vel;
        else if (this._keys.down.isDown  || this._wasd.down.isDown)  vy = vel;

        if (vx !== 0 && vy !== 0) { vx *= 0.7071; vy *= 0.7071; }

        this.player.body.setVelocity(vx, vy);
    }


    _interagirPorProximidade() {
        // As próprias funções de interação já verificam a distância
        this._interagirMochila();
        this._interagirAmiga();
    }


    _interagirAmiga() {
        if (this._fase !== 'exploracao') return;

        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this._amigaX, this._amigaY);
        if (dist > 90) return; // Distância máxima permitida diminuída

        if (!this._mochilaEncontrada) {
            // Bloqueio: mostrar balão de texto
            this._mostrarBalãoBloqueio();
        } else {
            // Diálogo liberado
            this._iniciarInterrogatorio();
        }
    }

    _mostrarBalãoBloqueio() {
        // Evitar balões duplicados
        if (this._balãoBloqueio) return;

        const { width } = this.scale;
        const bx = this._amigaX;
        const by = this._amigaY - 80;

        // Fundo do balão
        this._balãoBloqueio = this.add.rectangle(bx, by, 520, 55, 0x0b1120, 0.95).setDepth(150);
        this._balãoBloqueio.setStrokeStyle(1, 0xa855f7, 0.7);

        // Texto
        this._balãoTexto = this.add.text(bx, by, TEXTO_BLOQUEIO, {
            fontSize: '13px', fontFamily: "'Courier New', monospace",
            color: '#c4b5fd', wordWrap: { width: 490 }, align: 'center'
        }).setOrigin(0.5).setDepth(151);

        // Fade in
        this._balãoBloqueio.setAlpha(0);
        this._balãoTexto.setAlpha(0);
        this.tweens.add({ targets: [this._balãoBloqueio, this._balãoTexto], alpha: 1, duration: 300 });

        // Auto-remover após 3.5s
        this.time.delayedCall(3500, () => {
            if (!this._balãoBloqueio) return;
            this.tweens.add({
                targets: [this._balãoBloqueio, this._balãoTexto],
                alpha: 0, duration: 400,
                onComplete: () => {
                    if (this._balãoBloqueio) this._balãoBloqueio.destroy();
                    if (this._balãoTexto) this._balãoTexto.destroy();
                    this._balãoBloqueio = null;
                    this._balãoTexto = null;
                }
            });
        });
    }

    _interagirMochila() {
        if (this._mochilaEncontrada) return;
        if (this._fase !== 'exploracao') return;

        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this._mochilaX, this._mochilaY);
        if (dist > 90) return; // Distância máxima permitida diminuída

        this._fase = 'popup_mochila';

        // Esconder instrução
        this.tweens.add({
            targets: [this._instrBg, this._instrText], alpha: 0, duration: 300
        });

        // Abrir popup
        this.time.delayedCall(300, () => this._criarPopupMochila());
    }

    _criarPopupMochila() {
        const { width, height } = this.scale;
        const popW = 650;
        const popH = 380;
        const cx = width / 2;
        const cy = height / 2;

        this._popupMochilaGrupo = [];

        // Overlay escuro
        this._popupOverlay = this.add.rectangle(cx, cy, width, height, 0x000000, 0.6).setDepth(200);
        this._popupOverlay.setAlpha(0);

        // Fundo do popup
        const bg = this.add.rectangle(cx, cy, popW, popH, 0x0b1120, 0.98).setDepth(201);
        bg.setStrokeStyle(2, 0xfbbf24, 0.8);
        this._popupMochilaGrupo.push(bg);

        // Linha decorativa
        const linhaTop = this.add.rectangle(cx, cy - popH / 2 + 55, popW - 40, 2, 0xfbbf24, 0.3).setDepth(202);
        this._popupMochilaGrupo.push(linhaTop);

        // Ícone
        const icone = this.add.text(cx, cy - 120, '🎒', { fontSize: '48px' }).setOrigin(0.5).setDepth(202);
        this._popupMochilaGrupo.push(icone);

        // Título
        const titulo = this.add.text(cx, cy - 65, 'MOCHILA DA VÍTIMA', {
            fontSize: '22px', fontFamily: "'Courier New', monospace",
            color: '#fbbf24', fontStyle: 'bold', letterSpacing: 3
        }).setOrigin(0.5).setDepth(202);
        this._popupMochilaGrupo.push(titulo);

        // Separador
        const sep = this.add.rectangle(cx, cy - 38, 250, 1, 0x334155).setDepth(202);
        this._popupMochilaGrupo.push(sep);

        // Ícones dos itens
        const itensY = cy - 10;
        const foto = this.add.text(cx - 60, itensY, '📷', { fontSize: '28px' }).setOrigin(0.5).setDepth(202);
        this._popupMochilaGrupo.push(foto);
        const fotoLabel = this.add.text(cx - 60, itensY + 25, 'Foto', {
            fontSize: '11px', fontFamily: "'Courier New', monospace", color: '#94a3b8'
        }).setOrigin(0.5).setDepth(202);
        this._popupMochilaGrupo.push(fotoLabel);

        const bilhete = this.add.text(cx + 60, itensY, '📝', { fontSize: '28px' }).setOrigin(0.5).setDepth(202);
        this._popupMochilaGrupo.push(bilhete);
        const bilheteLabel = this.add.text(cx + 60, itensY + 25, 'Bilhete', {
            fontSize: '11px', fontFamily: "'Courier New', monospace", color: '#94a3b8'
        }).setOrigin(0.5).setDepth(202);
        this._popupMochilaGrupo.push(bilheteLabel);

        // Texto da pista
        const textoY = cy + 55;
        const texto = this.add.text(cx, textoY, TEXTO_MOCHILA, {
            fontSize: '14px', fontFamily: "'Courier New', monospace",
            color: '#e2e8f0', wordWrap: { width: popW - 80 }, align: 'center',
            lineSpacing: 5, fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(202);
        this._popupMochilaGrupo.push(texto);

        // Botão GUARDAR
        const btnY = cy + 140;
        const btnBg = this.add.rectangle(cx, btnY, 220, 55, 0xfbbf24).setDepth(203);
        btnBg.setInteractive({ useHandCursor: true });
        this._popupMochilaGrupo.push(btnBg);

        const btnText = this.add.text(cx, btnY, '📥  GUARDAR', {
            fontSize: '18px', fontFamily: "'Courier New', monospace",
            color: '#0a0a0a', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(204);
        btnText.setInteractive({ useHandCursor: true });
        this._popupMochilaGrupo.push(btnText);

        // Hover no botão
        btnBg.on('pointerover', () => {
            this.tweens.add({ targets: [btnBg, btnText], scaleX: 1.05, scaleY: 1.05, duration: 100 });
            btnBg.setFillStyle(0xe5a800);
        });
        btnBg.on('pointerout', () => {
            this.tweens.add({ targets: [btnBg, btnText], scaleX: 1, scaleY: 1, duration: 100 });
            btnBg.setFillStyle(0xfbbf24);
        });

        // Pulsação
        this.tweens.add({
            targets: btnText, alpha: 0.6, yoyo: true, repeat: -1, duration: 1000, ease: 'Sine.easeInOut', delay: 500
        });

        // Clique no GUARDAR
        const onGuardar = () => this._aoClicarGuardar();
        btnBg.on('pointerdown', onGuardar);
        btnText.on('pointerdown', onGuardar);

        // Animação de entrada
        this._popupMochilaGrupo.forEach(o => o.setAlpha(0));
        this.tweens.add({ targets: this._popupOverlay, alpha: 1, duration: 400 });
        this.tweens.add({ targets: this._popupMochilaGrupo, alpha: 1, duration: 500, delay: 200, ease: 'Power2' });
    }

    _aoClicarGuardar() {
        if (this._mochilaEncontrada) return; // evitar clique duplo

        this._mochilaEncontrada = true;

        // Atualizar GameState
        GameState.adicionarItem('foto_vitima');
        GameState.adicionarItem('bilhete_suspeito');
        GameState.anotarPista('bilhete_suspeito');

        // Fechar popup destruindo objetos
        this._popupMochilaGrupo.forEach(o => {
            this.tweens.killTweensOf(o);
            if (o.input) o.disableInteractive();
            o.destroy();
        });
        if (this._popupOverlay) {
            this.tweens.killTweensOf(this._popupOverlay);
            this._popupOverlay.destroy();
            this._popupOverlay = null;
        }
        this._popupMochilaGrupo = [];

        // Remover mochila do cenário (já foi coletada)
        this._mochila.disableInteractive();
        this.tweens.killTweensOf(this._mochilaPulse);
        this.tweens.add({
            targets: [this._mochila, this._mochilaIcon, this._mochilaGlow, this._mochilaPulse],
            alpha: 0, duration: 500,
            onComplete: () => {
                this._mochila.destroy();
                this._mochilaIcon.destroy();
                this._mochilaGlow.destroy();
                this._mochilaPulse.destroy();
            }
        });

        // Atualizar instrução
        this._instrText.setText('Agora fale com a amiga para descobrir o que aconteceu');
        this._instrText.setColor('#c4b5fd');
        this.tweens.add({ targets: [this._instrBg, this._instrText], alpha: 1, duration: 400 });

        this._fase = 'exploracao';
    }

    _iniciarInterrogatorio() {
        this._fase = 'dialogo';
        this._dialogoIndex = 0;

        // Esconder instrução
        this.tweens.add({
            targets: [this._instrBg, this._instrText], alpha: 0, duration: 300,
            onComplete: () => {
                this._instrBg.setVisible(false);
                this._instrText.setVisible(false);
            }
        });

        this.time.delayedCall(400, () => this._criarDialogo());
    }

    _criarDialogo() {
        const { width, height } = this.scale;
        const boxH = 250;
        const boxY = height - boxH / 2 - 10;

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

        // Overlay escurecido no topo
        const overlay = this.add.rectangle(width / 2, (height - boxH) / 2, width, height - boxH, 0x000000, 0.45).setDepth(150);
        this._dialogoGrupo.push(overlay);

        // Caixa de diálogo (inferior)
        const box = this.add.rectangle(width / 2, boxY, width - 30, boxH, 0x0b1120, 0.97).setDepth(150);
        box.setStrokeStyle(2, 0x6366f1, 0.9);
        this._dialogoGrupo.push(box);

        // Retrato ESQUERDO (quem fala primeiro → Policial)
        this._retratoBoxEsq = this.add.rectangle(120, boxY, 130, 130, 0x1e3a5f).setDepth(151);
        this._retratoBoxEsq.setStrokeStyle(2, 0x6366f1, 0.8);
        this._dialogoGrupo.push(this._retratoBoxEsq);

        this._retratoEmojiEsq = this.add.text(120, boxY, '👮', { fontSize: '52px' })
            .setOrigin(0.5).setDepth(152);
        this._dialogoGrupo.push(this._retratoEmojiEsq);

        this._nomeBadgeEsqBg = this.add.rectangle(120, boxY - 82, 150, 32, 0x6366f1).setDepth(153);
        this._dialogoGrupo.push(this._nomeBadgeEsqBg);

        this._nomeTextEsq = this.add.text(120, boxY - 82, 'DETETIVE', {
            fontSize: '13px', fontFamily: "'Courier New', monospace",
            color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(154);
        this._dialogoGrupo.push(this._nomeTextEsq);

        // Retrato DIREITO (Amiga)
        this._retratoBoxDir = this.add.rectangle(width - 120, boxY, 130, 130, 0x2d1a3a).setDepth(151);
        this._retratoBoxDir.setStrokeStyle(2, 0xa855f7, 0.8);
        this._dialogoGrupo.push(this._retratoBoxDir);

        this._retratoEmojiDir = this.add.text(width - 120, boxY, '😢', { fontSize: '52px' })
            .setOrigin(0.5).setDepth(152);
        this._dialogoGrupo.push(this._retratoEmojiDir);

        this._nomeBadgeDirBg = this.add.rectangle(width - 120, boxY - 82, 150, 32, 0xa855f7).setDepth(153);
        this._dialogoGrupo.push(this._nomeBadgeDirBg);

        this._nomeTextDir = this.add.text(width - 120, boxY - 82, 'AMIGA', {
            fontSize: '13px', fontFamily: "'Courier New', monospace",
            color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(154);
        this._dialogoGrupo.push(this._nomeTextDir);

        // Texto do diálogo (centro)
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

        // Indicador de continuar
        this._continuarText = this.add.text(width / 2, boxY + boxH / 2 - 22, '▶  CLIQUE  /  ESPAÇO', {
            fontSize: '13px', fontFamily: "'Courier New', monospace", color: '#6366f1'
        }).setOrigin(0.5, 1).setDepth(153);
        this.tweens.add({
            targets: this._continuarText,
            alpha: 0.25, yoyo: true, repeat: -1, duration: 750
        });
        this._dialogoGrupo.push(this._continuarText);

        // Clique para avançar
        this._dialogoClickHandler = () => {
            if (this._fase === 'dialogo') this._avancarDialogo();
        };
        this.input.on('pointerdown', this._dialogoClickHandler);

        // Mostrar primeira fala
        this._mostrarFala();
    }

    _mostrarFala() {
        if (this._dialogoIndex >= this._roteiro.length) {
            this._encerrarDialogo();
            return;
        }

        const fala = this._roteiro[this._dialogoIndex];
        const isPolicial = fala.falante === 'policial';

        // Destacar quem está falando (opacidade)
        // Policial (esquerda)
        const alphaEsq = isPolicial ? 1 : 0.4;
        this._retratoBoxEsq.setAlpha(alphaEsq);
        this._retratoEmojiEsq.setAlpha(alphaEsq);
        this._nomeBadgeEsqBg.setAlpha(alphaEsq);
        this._nomeTextEsq.setAlpha(alphaEsq);

        // Amiga (direita)
        const alphaDir = isPolicial ? 0.4 : 1;
        this._retratoBoxDir.setAlpha(alphaDir);
        this._retratoEmojiDir.setAlpha(alphaDir);
        this._nomeBadgeDirBg.setAlpha(alphaDir);
        this._nomeTextDir.setAlpha(alphaDir);

        // Cor e estilo do texto
        if (fala.italico) {
            this._dialogoText.setColor('#c4b5fd');
            this._dialogoText.setFontStyle('italic');
        } else {
            this._dialogoText.setColor('#e2e8f0');
            this._dialogoText.setFontStyle('normal');
        }

        // Efeito typewriter
        this._typewriterText(fala.texto);

        // Contador
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
        // Se ainda está digitando, mostra tudo
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

        // Travar fase imediatamente para evitar re-entrada
        this._fase = 'encerrando_dialogo';

        // Remover handler de clique
        if (this._dialogoClickHandler) {
            this.input.off('pointerdown', this._dialogoClickHandler);
        }

        // Fade out dos elementos de diálogo
        this.tweens.add({
            targets: this._dialogoGrupo,
            alpha: 0, duration: 400,
            onComplete: () => {
                this._dialogoGrupo.forEach(obj => obj.destroy());
                this._dialogoGrupo = [];

                // Registrar no GameState
                GameState.anotarPista('relato_violencia_psicologica');
                GameState.registrarAnotacaoInterrogatorio(
                    'amiga', 'Amiga da Vítima', GameState.diaAtual,
                    'Relato de violência psicológica pelo parceiro. Vítima saiu correndo após briga. Próximo destino: lanchonete.'
                );

                // Mostrar popup de missão
                this.time.delayedCall(400, () => this._mostrarPopupMissao());
            }
        });
    }

    _mostrarPopupMissao() {
        this._fase = 'missao';
        const { width, height } = this.scale;

        // Overlay
        this._missaoOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setDepth(200);
        this._missaoOverlay.setAlpha(0);

        const popW = 620;
        const popH = 340;
        const cx = width / 2;
        const cy = height / 2;

        this._missaoGrupo = [];

        // Fundo
        const popBg = this.add.rectangle(cx, cy, popW, popH, 0x0b1120, 0.98).setDepth(201);
        popBg.setStrokeStyle(2, 0x6366f1, 0.9);
        this._missaoGrupo.push(popBg);

        // Linha decorativa
        const linhaTop = this.add.rectangle(cx, cy - popH / 2 + 50, popW - 40, 2, 0x6366f1, 0.4).setDepth(202);
        this._missaoGrupo.push(linhaTop);

        // Ícone
        const icone = this.add.text(cx, cy - 110, '📋', { fontSize: '42px' }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(icone);

        // Título
        const titulo = this.add.text(cx, cy - 55, 'NOVO OBJETIVO', {
            fontSize: '24px', fontFamily: "'Courier New', monospace",
            color: '#f8fafc', fontStyle: 'bold', letterSpacing: 3
        }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(titulo);

        // Separador
        const sep = this.add.rectangle(cx, cy - 25, 200, 1, 0x334155).setDepth(202);
        this._missaoGrupo.push(sep);

        // Objetivo
        const objetivo = this.add.text(cx, cy + 5, '📌  Investigar a lanchonete', {
            fontSize: '18px', fontFamily: "'Courier New', monospace",
            color: '#fbbf24', align: 'center'
        }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(objetivo);

        // Pista
        const pista = this.add.text(cx, cy + 45, '🔍  Pista Nova: Relato de violência\npsicológica e bilhete suspeito', {
            fontSize: '14px', fontFamily: "'Courier New', monospace",
            color: '#94a3b8', align: 'center', lineSpacing: 5
        }).setOrigin(0.5).setDepth(202);
        this._missaoGrupo.push(pista);

        // Botão VAMOS
        const btnBg = this.add.rectangle(cx, cy + 120, 220, 55, 0x6366f1).setDepth(203);
        btnBg.setInteractive({ useHandCursor: true });
        this._missaoGrupo.push(btnBg);

        const btnText = this.add.text(cx, cy + 120, '▶  VAMOS', {
            fontSize: '20px', fontFamily: "'Courier New', monospace",
            color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(204);
        btnText.setInteractive({ useHandCursor: true });
        this._missaoGrupo.push(btnText);

        // Pulsação no botão
        this.tweens.add({
            targets: btnText, alpha: 0.65, yoyo: true, repeat: -1,
            duration: 1000, ease: 'Sine.easeInOut', delay: 600
        });

        // Hover
        btnBg.on('pointerover', () => {
            this.tweens.add({ targets: [btnBg, btnText], scaleX: 1.05, scaleY: 1.05, duration: 120 });
            btnBg.setFillStyle(0x4f46e5);
        });
        btnBg.on('pointerout', () => {
            this.tweens.add({ targets: [btnBg, btnText], scaleX: 1, scaleY: 1, duration: 120 });
            btnBg.setFillStyle(0x6366f1);
        });

        // Clique no VAMOS
        btnBg.on('pointerdown', () => this._aoClicarVamos());
        btnText.on('pointerdown', () => this._aoClicarVamos());

        // Animação de entrada
        this._missaoGrupo.forEach(o => o.setAlpha(0));
        this.tweens.add({ targets: this._missaoOverlay, alpha: 1, duration: 400 });
        this.tweens.add({ targets: this._missaoGrupo, alpha: 1, duration: 500, delay: 200, ease: 'Power2' });
    }

    _aoClicarVamos() {
        if (this._fase !== 'missao') return;
        this._fase = 'saindo_missao';

        // Matar TODOS os tweens que afetam os objetos do popup
        this._missaoGrupo.forEach(o => {
            this.tweens.killTweensOf(o);
            if (o.input) o.disableInteractive();
        });
        if (this._missaoOverlay) this.tweens.killTweensOf(this._missaoOverlay);

        // Destruir todos os objetos do popup
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

        // Destaque visual na porta
        this._portaHighlight.setStrokeStyle(3, 0xfbbf24, 0.8);
        this.tweens.add({
            targets: this._portaHighlight,
            alpha: 0.9, yoyo: true, repeat: -1, duration: 800, ease: 'Sine.easeInOut'
        });

        // Seta apontando para a porta
        this._portaSeta = this.add.text(this._portaX, this._portaY - 90, '▼', {
            fontSize: '28px', fontFamily: "'Courier New', monospace",
            color: '#fbbf24', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
            targets: this._portaSeta,
            y: this._portaY - 75,
            yoyo: true, repeat: -1, duration: 600, ease: 'Sine.easeInOut'
        });

        // Porta label visível
        this._portaLabel.setAlpha(1);
        this._portaLabel.setColor('#fbbf24');

        // Texto de instrução
        const { width, height } = this.scale;
        this._saidaText = this.add.text(width / 2, height - 100,
            'Dirija-se à porta de saída para investigar a lanchonete', {
                fontSize: '17px', fontFamily: "'Courier New', monospace",
                color: '#fbbf24', align: 'center',
                backgroundColor: '#050c18dd', padding: { x: 15, y: 8 }
            }).setOrigin(0.5).setDepth(100);

        // Porta interativa
        this._porta.setInteractive({ useHandCursor: true });
        this._porta.on('pointerdown', () => this._sairCasa());

        // Overlap com a zona da porta
        this.physics.add.overlap(this.player, this._portaZona, () => this._sairCasa());
    }

    _sairCasa() {
        if (this._fase !== 'saida') return;
        this._fase = 'transicao';

        // Salvar no GameState
        GameState.flags.fase_02_concluida = true;
        GameState.flags.objetivo_atual = 'investigar_lanchonete';
        GameState.flags.cenario_03_desbloqueado = true;

        // Fade out e transição
        this.cameras.main.fadeOut(1200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Carregar próxima cena (MapaScene como fallback até a Cena 03 existir)
            this.scene.start('MapaScene');
        });
    }
}
