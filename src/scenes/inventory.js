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
        this.add.text(px, py - panelH / 2 + 25, '📓  ANOTAÇÕES', {
            fontSize: '22px', fontFamily: "'Courier New', monospace", color: '#f8fafc', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(px, py - panelH / 2 + 55, `${GameState.getDiaTexto()}  •  ${GameState.getHoraFormatada()}  •  ${GameState.getAcoesRestantes()} ações restantes`, {
            fontSize: '13px', fontFamily: "'Courier New', monospace", color: '#475569'
        }).setOrigin(0.5);

        // Tabs
        const tabY = py - panelH / 2 + 100;
        this._criarTab(px - 160, tabY, '🔍  PISTAS COLETADAS', 'caderno');
        this._criarTab(px + 160, tabY, '🎒  INVENTÁRIO', 'inventario');

        // Conteúdo
        const contentStartY = py - panelH / 2 + 140;
        const contentH = panelH - 200;
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

    _mostrarPistas(cx, startY, panelW, panelH) {
        const pistasData = this.cache.json.get('pistas');
        const pistas = GameState.pistasAnotadas;

        if (pistas.length === 0) {
            this.add.text(cx, startY + panelH / 2 - 80,
                '[ Nenhuma pista anotada ainda ]\n\nExamine os objetos destacados na cena do crime.', {
                fontSize: '17px', fontFamily: "'Courier New', monospace",
                color: '#475569', align: 'center', lineSpacing: 8
            }).setOrigin(0.5);
            return;
        }

        const entryH = 80;
        pistas.forEach((pistaId, i) => {
            const pista = pistasData?.pistas?.[pistaId];
            if (!pista) return;

            const ey = startY + 10 + i * (entryH + 8);
            const entryBg = this.add.rectangle(cx, ey + entryH / 2, panelW - 20, entryH, 0x1e293b);
            entryBg.setStrokeStyle(1, 0x334155);

            this.add.text(cx - panelW / 2 + 30, ey + 12, `🔍  ${pista.titulo}`, {
                fontSize: '15px', fontFamily: "'Courier New', monospace",
                color: '#fbbf24', fontStyle: 'bold'
            }).setOrigin(0, 0);

            this.add.text(cx - panelW / 2 + 30, ey + 38, pista.descricao, {
                fontSize: '13px', fontFamily: "'Courier New', monospace",
                color: '#94a3b8', wordWrap: { width: panelW - 70 }
            }).setOrigin(0, 0);
        });
    }

    _mostrarInventario(cx, startY, panelW, panelH) {
        const itens = GameState.inventario;
        if (itens.length === 0) {
            this.add.text(cx, startY + panelH / 2 - 80, '[ Nenhum item coletado ainda ]', {
                fontSize: '17px', fontFamily: "'Courier New', monospace", color: '#475569'
            }).setOrigin(0.5);
            return;
        }
        itens.forEach((item, i) => {
            this.add.text(cx, startY + 20 + i * 35, `• ${item}`, {
                fontSize: '15px', fontFamily: "'Courier New', monospace", color: '#e2e8f0'
            }).setOrigin(0.5);
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
