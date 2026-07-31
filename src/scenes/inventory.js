/**
 * InventoryScene — Cena overlay de Inventário e Caderno de Anotações.
 * Lançada sobre a MapaScene (que é pausada).
 *
 * Dados recebidos via init(data):
 *   - abaInicial {string} — 'inventario' ou 'caderno' (padrão: 'caderno')
 */
import { GameState } from '../utils/GameState.js';

export class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InventoryScene' });
    }

    init(data) {
        this.abaAtiva = data?.abaInicial || 'caderno';
    }

    create() {
        const { width, height } = this.scale;
        const panelW = 980, panelH = 720;
        const px = width / 2, py = height / 2;

        // Overlay de fundo
        const overlay = this.add.rectangle(px, py, width, height, 0x000000, 0.82)
            .setInteractive(); // bloqueia cliques no fundo

        // Painel principal
        this.add.rectangle(px, py, panelW, panelH, 0x0b1120);
        this.add.rectangle(px, py, panelW, panelH, 0, 0).setStrokeStyle(2, 0x6366f1, 0.9);

        // Cabeçalho
        this.add.rectangle(px, py - panelH / 2 + 38, panelW, 76, 0x1e293b);
        this.add.text(px, py - panelH / 2 + 25, '🔍​ PISTAS', {
            fontSize: '22px', fontFamily: "'Courier New', monospace", color: '#f8fafc', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(px, py - panelH / 2 + 55, `${GameState.getDiaTexto()}  •  ${GameState.getHoraFormatada()}  •  ${GameState.getAcoesRestantes()} ações restantes`, {
            fontSize: '13px', fontFamily: "'Courier New', monospace", color: '#475569'
        }).setOrigin(0.5);

        // Tabs
        const tabY = py - panelH / 2 + 100;
        this._criarTab(px - 160, tabY, '✏️ Anotações', 'caderno');
        this._criarTab(px + 160, tabY, '🎒 Inventário', 'inventario');

        // Conteúdo — área com scroll
        const contentStartY = py - panelH / 2 + 125;
        const contentH = panelH - 195;
        if (this.abaAtiva === 'caderno') {
            this._mostrarPistas(px, contentStartY, panelW - 60, contentH);
        } else {
            this._mostrarInventario(px, contentStartY, panelW - 60, contentH);
        }

        // Rodapé
        const btnClose = this.add.text(px, py + panelH / 2 - 28, '[ ESC ]  FECHAR', {
            fontSize: '16px', fontFamily: "'Courier New', monospace", color: '#6366f1'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btnClose.on('pointerover', () => btnClose.setColor('#818cf8'));
        btnClose.on('pointerout', () => btnClose.setColor('#6366f1'));
        btnClose.on('pointerdown', () => this._fechar());

        // Tecla ESC
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
            .on('down', () => this._fechar());

        this.cameras.main.fadeIn(220);
    }

    _criarTab(x, y, label, abaId) {
        const ativa = this.abaAtiva === abaId;
        const bg = this.add.rectangle(x, y, 270, 42, ativa ? 0x6366f1 : 0x1e293b)
            .setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(1, ativa ? 0x818cf8 : 0x334155);
        this.add.text(x, y, label, {
            fontSize: '14px', fontFamily: "'Courier New', monospace",
            color: ativa ? '#ffffff' : '#94a3b8'
        }).setOrigin(0.5);
        if (!ativa) {
            bg.on('pointerover', () => bg.setFillStyle(0x334155));
            bg.on('pointerout', () => bg.setFillStyle(0x1e293b));
            bg.on('pointerdown', () => {
                this.scene.restart({ abaInicial: abaId });
            });
        }
    }

    /**
     * Cria uma área scrollável com máscara e scroll por roda do mouse.
     * @param {number} cx - Centro X da área
     * @param {number} topY - Y do topo da área visível
     * @param {number} areaW - Largura da área
     * @param {number} areaH - Altura da área visível
     * @param {Function} renderFn - Função (container, localY) => totalHeight que renderiza o conteúdo
     */
    _criarAreaScrollavel(cx, topY, areaW, areaH, renderFn) {
        // Container para todo o conteúdo scrollável
        const container = this.add.container(0, 0);

        // Renderiza o conteúdo e obtém a altura total
        const totalH = renderFn(container, topY + 15);

        // Máscara para recortar o conteúdo à área visível
        const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(cx - areaW / 2, topY, areaW, areaH);
        const mask = maskShape.createGeometryMask();
        container.setMask(mask);

        // Scroll por roda do mouse
        const maxScroll = Math.max(0, totalH - areaH + 30);
        let scrollY = 0;

        if (maxScroll > 0) {
            this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
                scrollY = Phaser.Math.Clamp(scrollY + deltaY * 0.5, 0, maxScroll);
                container.y = -scrollY;
            });

            // Indicador de scroll (barra lateral)
            const barH = Math.max(30, (areaH / (areaH + maxScroll)) * areaH);
            const barX = cx + areaW / 2 - 6;
            const barTrack = this.add.rectangle(barX, topY + areaH / 2, 4, areaH, 0x1e293b, 0.5);
            const barThumb = this.add.rectangle(barX, topY + barH / 2, 4, barH, 0x6366f1, 0.6);

            this.input.on('wheel', () => {
                const ratio = scrollY / maxScroll;
                barThumb.y = topY + barH / 2 + ratio * (areaH - barH);
            });
        }
    }

    _mostrarPistas(cx, startY, panelW, panelH) {
        const anotacoes = GameState.getAnotacoesInterrogatorios();

        if (anotacoes.length === 0) {
            this.add.text(cx, startY + panelH / 2 - 80,
                '[ Nenhuma anotação ainda ]\n\nInterrogue os suspeitos para anotar os principais pontos dos interrogatórios.', {
                fontSize: '17px', fontFamily: "'Courier New', monospace",
                color: '#475569', align: 'center', lineSpacing: 8
            }).setOrigin(0.5);
            return;
        }

        this._criarAreaScrollavel(cx, startY, panelW, panelH, (container, localY) => {
            let py = localY;

            // Título da seção
            const titulo = this.add.text(cx, py + 8, '🗣️  ANOTAÇÕES DE INTERROGATÓRIOS', {
                fontSize: '15px', fontFamily: "'Courier New', monospace",
                color: '#6366f1', fontStyle: 'bold'
            }).setOrigin(0.5);
            container.add(titulo);
            py += 30;

            const entryH = 72;
            anotacoes.forEach((nota) => {
                const ey = py;
                const entryBg = this.add.rectangle(cx, ey + entryH / 2, panelW - 20, entryH, 0x111d36);
                entryBg.setStrokeStyle(1, 0x1e3a5f);
                container.add(entryBg);

                const header = this.add.text(cx - panelW / 2 + 30, ey + 10, `🗣️  ${nota.npcNome}  —  Dia ${nota.dia}`, {
                    fontSize: '14px', fontFamily: "'Courier New', monospace",
                    color: '#818cf8', fontStyle: 'bold'
                }).setOrigin(0, 0);
                container.add(header);

                const body = this.add.text(cx - panelW / 2 + 30, ey + 34, `"${nota.pontoChave}"`, {
                    fontSize: '13px', fontFamily: "'Courier New', monospace",
                    color: '#94a3b8', fontStyle: 'italic',
                    wordWrap: { width: panelW - 70 }
                }).setOrigin(0, 0);
                container.add(body);

                py += entryH + 8;
            });

            return py - localY;
        });
    }

    _mostrarInventario(cx, startY, panelW, panelH) {
        const pistasData = this.cache.json.get('pistas');
        const pistas = GameState.pistasAnotadas;

        if (pistas.length === 0) {
            this.add.text(cx, startY + panelH / 2 - 80, '[ Nenhum item coletado ainda ]\n\nColete pistas para adicioná-las aqui.', {
                fontSize: '17px', fontFamily: "'Courier New', monospace", color: '#475569',
                align: 'center', lineSpacing: 8
            }).setOrigin(0.5);
            return;
        }

        this._criarAreaScrollavel(cx, startY, panelW, panelH, (container, localY) => {
            let py = localY;

            const titulo = this.add.text(cx, py + 8, '🔍  PISTAS COLETADAS', {
                fontSize: '15px', fontFamily: "'Courier New', monospace",
                color: '#fbbf24', fontStyle: 'bold'
            }).setOrigin(0.5);
            container.add(titulo);
            py += 30;

            const entryH = 80;
            pistas.forEach((pistaId) => {
                const pista = pistasData?.pistas?.[pistaId];
                if (!pista) return;

                const ey = py;
                const entryBg = this.add.rectangle(cx, ey + entryH / 2, panelW - 20, entryH, 0x1e293b);
                entryBg.setStrokeStyle(1, 0x334155);
                container.add(entryBg);

                const titleTxt = this.add.text(cx - panelW / 2 + 30, ey + 12, `🔍  ${pista.titulo}`, {
                    fontSize: '15px', fontFamily: "'Courier New', monospace",
                    color: '#fbbf24', fontStyle: 'bold'
                }).setOrigin(0, 0);
                container.add(titleTxt);

                const descTxt = this.add.text(cx - panelW / 2 + 30, ey + 38, pista.descricao, {
                    fontSize: '13px', fontFamily: "'Courier New', monospace",
                    color: '#94a3b8', wordWrap: { width: panelW - 70 }
                }).setOrigin(0, 0);
                container.add(descTxt);

                py += entryH + 8;
            });

            return py - localY;
        });
    }

    _fechar() {
        this.cameras.main.fadeOut(220, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.stop('InventoryScene');
            this.scene.resume('MapaScene');
        });
    }
}
