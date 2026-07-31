/**
 * JulgamentoScene — Dossiê Final na Delegacia de Polícia.
 * O jogador analisa o relatório de provas e decide quem mandar prender.
 * Apresenta 4 desfechos: prisão efetuada, falta de provas, erro de investigação e caso arquivado.
 */
import { GameState } from '../utils/GameState.js';

export class JulgamentoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'JulgamentoScene' });
    }

    create() {
        const { width, height } = this.scale;
        this._criarTelaAcusacao(width, height);
        this.cameras.main.fadeIn(700);
    }

    _criarTelaAcusacao(width, height) {
        const pistasData = this.cache.json.get('pistas');

        // Fundo
        this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a);

        // Cabeçalho da Delegacia
        this.add.rectangle(width / 2, 65, width, 130, 0x1e293b);
        this.add.rectangle(width / 2, 130, width, 2, 0x6366f1, 0.4);
        this.add.text(width / 2, 35, '🚨    DELEGACIA DE POLÍCIA — DOSSIÊ FINAL', {
            fontSize: '36px', fontFamily: "'Courier New', monospace",
            color: '#f8fafc', fontStyle: 'bold', letterSpacing: 4
        }).setOrigin(0.5);
        this.add.text(width / 2, 95, 'Com as provas e depoimentos reunidos, quem você vai mandar a equipe prender?', {
            fontSize: '15px', fontFamily: "'Courier New', monospace", color: '#64748b'
        }).setOrigin(0.5);

        // Painel esquerdo: pistas e depoimentos
        this._criarPainelPistas(pistasData, width, height);

        // Painel direito: suspeitos
        this._criarPainelSuspeitos(width, height);

        // Botão para deixar o caso em aberto
        const btnI = this.add.rectangle(width / 2, height - 55, 520, 50, 0x1e293b)
            .setInteractive({ useHandCursor: true });
        btnI.setStrokeStyle(1, 0x475569);
        this.add.text(width / 2, height - 55, '📁    Falta de provas / Deixar o caso em aberto', {
            fontSize: '16px', fontFamily: "'Courier New', monospace", color: '#94a3b8'
        }).setOrigin(0.5);
        btnI.on('pointerover', () => btnI.setFillStyle(0x334155));
        btnI.on('pointerout', () => btnI.setFillStyle(0x1e293b));
        btnI.on('pointerdown', () => this._mostrarFinal('inconclusivo', null));
    }

    _criarPainelPistas(pistasData, width, height) {
        const lx = 370, lw = 680;
        const panelTopY = 145;
        const panelH = height - 245;

        this.add.text(lx, panelTopY, '📓    PISTAS E DEPOIMENTOS COLETADOS:', {
            fontSize: '17px', fontFamily: "'Courier New', monospace",
            color: '#fbbf24', fontStyle: 'bold'
        }).setOrigin(0.5);

        const pistas = GameState.pistasAnotadas;
        const anotacoes = GameState.getAnotacoesInterrogatorios();

        if (pistas.length === 0 && anotacoes.length === 0) {
            this.add.text(lx, panelTopY + 80, 'Nenhuma pista coletada!', {
                fontSize: '16px', fontFamily: "'Courier New', monospace", color: '#ef4444'
            }).setOrigin(0.5);
            this.add.text(lx, panelTopY + 120, 'Você não investigou nada.\nO delegado não aprovará nenhum mandado de prisão.', {
                fontSize: '14px', fontFamily: "'Courier New', monospace",
                color: '#475569', align: 'center', lineSpacing: 6
            }).setOrigin(0.5);
            return;
        }

        // Área scrollável
        const scrollTopY = panelTopY + 25;
        const scrollH = panelH - 30;
        const container = this.add.container(0, 0);

        let py = scrollTopY + 10;

        // Pistas coletadas
        pistas.forEach((pistaId) => {
            const pista = pistasData?.pistas?.[pistaId];
            if (!pista) return;
            const bg = this.add.rectangle(lx, py + 32, lw - 10, 60, 0x1e293b);
            bg.setStrokeStyle(1, 0x334155);
            container.add(bg);
            const t1 = this.add.text(lx - lw / 2 + 20, py + 10, `🔍    ${pista.titulo}`, {
                fontSize: '14px', fontFamily: "'Courier New', monospace", color: '#fbbf24', fontStyle: 'bold'
            }).setOrigin(0);
            container.add(t1);
            const t2 = this.add.text(lx - lw / 2 + 20, py + 32, pista.descricao, {
                fontSize: '12px', fontFamily: "'Courier New', monospace",
                color: '#94a3b8', wordWrap: { width: lw - 50 }
            }).setOrigin(0);
            container.add(t2);
            py += 72;
        });

        // Anotações de interrogatórios
        if (anotacoes.length > 0) {
            py += 8;
            const secTitle = this.add.text(lx, py + 10, '🗣️    DEPOIMENTOS DA INVESTIGAÇÃO:', {
                fontSize: '15px', fontFamily: "'Courier New', monospace",
                color: '#6366f1', fontStyle: 'bold'
            }).setOrigin(0.5);
            container.add(secTitle);
            py += 30;

            anotacoes.forEach((nota) => {
                const bg = this.add.rectangle(lx, py + 25, lw - 10, 50, 0x111d36);
                bg.setStrokeStyle(1, 0x1e3a5f);
                container.add(bg);
                const t1 = this.add.text(lx - lw / 2 + 20, py + 8, `${nota.npcNome} (Dia ${nota.dia}):`, {
                    fontSize: '12px', fontFamily: "'Courier New', monospace",
                    color: '#818cf8', fontStyle: 'bold'
                }).setOrigin(0);
                container.add(t1);
                const t2 = this.add.text(lx - lw / 2 + 20, py + 26, nota.pontoChave, {
                    fontSize: '11px', fontFamily: "'Courier New', monospace",
                    color: '#94a3b8', fontStyle: 'italic',
                    wordWrap: { width: lw - 50 }
                }).setOrigin(0);
                container.add(t2);
                py += 58;
            });
        }

        const totalContentH = py - scrollTopY;

        // Máscara de recorte
        const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(lx - lw / 2, scrollTopY, lw, scrollH);
        container.setMask(maskShape.createGeometryMask());

        // Scroll do mouse
        const maxScroll = Math.max(0, totalContentH - scrollH + 20);
        let scrollOffset = 0;

        if (maxScroll > 0) {
            const barH = Math.max(30, (scrollH / (scrollH + maxScroll)) * scrollH);
            const barX = lx + lw / 2 - 8;
            this.add.rectangle(barX, scrollTopY + scrollH / 2, 4, scrollH, 0x1e293b, 0.5);
            const barThumb = this.add.rectangle(barX, scrollTopY + barH / 2, 4, barH, 0x6366f1, 0.6);

            this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
                scrollOffset = Phaser.Math.Clamp(scrollOffset + deltaY * 0.5, 0, maxScroll);
                container.y = -scrollOffset;

                const ratio = scrollOffset / maxScroll;
                barThumb.y = scrollTopY + barH / 2 + ratio * (scrollH - barH);
            });
        }
    }

    _criarPainelSuspeitos(width, height) {
        this.add.text(width - 660, 160, '👤    EMITIR MANDADO DE PRISÃO:', {
            fontSize: '17px', fontFamily: "'Courier New', monospace",
            color: '#6366f1', fontStyle: 'bold'
        }).setOrigin(0);

        const suspeitos = [
            { id: 'marco',   nome: 'Marco',   papel: 'Chefe da Empresa', cor: 0xef4444, x: 1120 },
            { id: 'elena',   nome: 'Elena',   papel: 'Mãe da Vítima',   cor: 0xc026d3, x: 1380 },
            { id: 'ricardo', nome: 'Ricardo', papel: 'Pai da Vítima',   cor: 0xfbbf24, x: 1640 },
        ];

        suspeitos.forEach(sus => {
            const cardH = 380;
            const cardY = height / 2 + 60;

            // Card do suspeito
            const card = this.add.rectangle(sus.x, cardY, 220, cardH, 0x1e293b)
                .setInteractive({ useHandCursor: true });
            card.setStrokeStyle(2, sus.cor, 0.35);

            // Silhueta
            this.add.rectangle(sus.x, cardY - 100, 52, 80, sus.cor, 0.85);
            this.add.circle(sus.x, cardY - 155, 24, sus.cor, 0.85);

            // Nome e Papel
            this.add.text(sus.x, cardY + 5, sus.nome, {
                fontSize: '15px', fontFamily: "'Courier New', monospace",
                color: '#f1f5f9', fontStyle: 'bold', wordWrap: { width: 190 }, align: 'center'
            }).setOrigin(0.5);

            this.add.text(sus.x, cardY + 35, sus.papel, {
                fontSize: '13px', fontFamily: "'Courier New', monospace", color: '#64748b'
            }).setOrigin(0.5);

            // Botão Prender
            const btnPrender = this.add.rectangle(sus.x, cardY + 140, 190, 46, sus.cor)
                .setInteractive({ useHandCursor: true });
            this.add.text(sus.x, cardY + 140, 'PRENDER', {
                fontSize: '17px', fontFamily: "'Courier New', monospace",
                color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);

            // Efeitos visuais de Hover
            card.on('pointerover', () => {
                card.setStrokeStyle(3, sus.cor, 0.85);
                this.tweens.add({ targets: card, scaleX: 1.04, scaleY: 1.04, duration: 140 });
            });
            card.on('pointerout', () => {
                card.setStrokeStyle(2, sus.cor, 0.35);
                this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 140 });
            });
            btnPrender.on('pointerover', () => btnPrender.setFillStyle(
                Phaser.Display.Color.ValueToColor(sus.cor).darken(20).color
            ));
            btnPrender.on('pointerout', () => btnPrender.setFillStyle(sus.cor));

            btnPrender.on('pointerdown', () => this._prender(sus));
            card.on('pointerdown', () => this._prender(sus));
        });
    }

    _prender(suspeito) {
        const resultado = GameState.calcularFinal(suspeito.id);
        this._mostrarFinal(resultado, suspeito);
    }

    _mostrarFinal(resultado, suspeito) {
        this.input.off('wheel');

        this.cameras.main.fadeOut(550, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.children.removeAll(true);
            this._criarTelaFinal(resultado, suspeito);
            this.cameras.main.fadeIn(900);
        });
    }

    _criarTelaFinal(resultado, suspeito) {
        const { width, height } = this.scale;

        const finais = {
            verdadeiro: {
                corFundo: 0x052e16, borderCor: 0x22c55e,
                emoji: '🚨', titulo: '✓  PRISÃO EFETUADA!',
                subtitulo: 'Marco Ferreira foi conduzido à delegacia e confessou!',
                texto:
                    '\n\n\nExcelente trabalho, Detetive.\n\n' +
                    'Com base nas provas apresentadas, a equipe interceptou Marco Ferreira.\n' +
                    'Confrontado na delegacia com o frasco de cianeto e as dívidas de R$ 2,3 milhões,\n' +
                    'ele não teve como negar e confessou o crime.\n\n' +
                    'Marco foi algemado e transferido para a penitenciária.\n' +
                    'O caso foi encerrado com sucesso!'
            },
            sem_provas: {
                corFundo: 0x1c1403, borderCor: 0xfbbf24,
                emoji: '⚠️', titulo: '⚠️  PROVAS INSUFICIENTES',
                subtitulo: 'Você apontou o suspeito certo, mas o delegado barrou o mandado.',
                texto:
                    '\n\nVocê desconfiou de Marco — e estava certo.\n' +
                    'Porém, sem provas suficientes no relatório, o mandado de prisão foi negado.\n\n' +
                    'Marco percebeu a movimentação da polícia e fugiu da cidade.\n' +
                    'O caso permanece sem solução.'
            },
            errado: {
                corFundo: 0x1c0505, borderCor: 0xef4444,
                emoji: '❌', titulo: '✗  ERRO DE INVESTIGAÇÃO',
                subtitulo: `Um inocente foi detido: ${suspeito?.nome || '?'}.`,
                texto:
                    `\n\n\nVocê mandou prender ${suspeito?.nome || 'um inocente'}, mas cometeu um erro grave.\n\n` +
                    'Enquanto a equipe perdia tempo interrogando a pessoa errada na delegacia,\n' +
                    'Marco Ferreira destruiu as evidências restantes e fugiu do país.\n\n' +
                    'O verdadeiro culpado ficou impune e um inocente teve a vida destruída.'
            },
            inconclusivo: {
                corFundo: 0x050e1a, borderCor: 0x3b82f6,
                emoji: '📁', titulo: '📁  CASO SEM RESPOSTAS',
                subtitulo: 'A investigação foi encerrada sem pedidos de prisão.',
                texto:
                    '\n\n\nVocê optou por não emitir nenhum mandado de prisão.\n\n' +
                    'Sem um suspeito principal definido, o dossiê foi arquivado na delegacia.\n' +
                    'Marco continuou sua vida normalmente e o mistério permanece.'
            }
        };

        const final = finais[resultado] || finais.inconclusivo;

        // Fundo com brilho suave da cor do resultado
        this.add.rectangle(width / 2, height / 2, width, height, final.corFundo, 0.65);

        // Card central de encerramento
        const cardW = 900, cardH = 520;
        const card = this.add.rectangle(width / 2, height / 2, cardW, cardH, 0x0b1120, 0.95);
        card.setStrokeStyle(3, final.borderCor, 0.85);

        // Emoji
        this.add.text(width / 2, height / 2 - 220, final.emoji, { fontSize: '64px' }).setOrigin(0.5);

        // Título
        this.add.text(width / 2, height / 2 - 148, final.titulo, {
            fontSize: '40px', fontFamily: "'Courier New', monospace",
            color: '#f8fafc', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtítulo
        this.add.text(width / 2, height / 2 - 93, final.subtitulo, {
            fontSize: '18px', fontFamily: "'Courier New', monospace", color: '#94a3b8'
        }).setOrigin(0.5);

        // Linha divisória
        this.add.rectangle(width / 2, height / 2 - 66, 640, 2, final.borderCor, 0.45);

        // Texto com a narrativa do desfecho
        this.add.text(width / 2, height / 2 + 10, final.texto, {
            fontSize: '17px', fontFamily: "'Courier New', monospace",
            color: '#e2e8f0', wordWrap: { width: 820 }, align: 'center', lineSpacing: 8
        }).setOrigin(0.5);

        // Estatísticas da partida
        this.add.text(width / 2, height / 2 + 215,
            `Pistas coletadas: ${GameState.pistasAnotadas.length} / 7    •    Dias utilizados: ${GameState.diaAtual} de ${GameState.maxDias}`,
            {
                fontSize: '14px', fontFamily: "'Courier New', monospace", color: '#475569'
            }
        ).setOrigin(0.5);

        // Botão para Jogar Novamente
        const btnReinicio = this.add.rectangle(width / 2, height - 65, 380, 58, 0x6366f1)
            .setInteractive({ useHandCursor: true });
        this.add.text(width / 2, height - 65, '↩  JOGAR NOVAMENTE', {
            fontSize: '20px', fontFamily: "'Courier New', monospace", color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        btnReinicio.on('pointerover', () => {
            this.tweens.add({ targets: btnReinicio, scaleX: 1.05, scaleY: 1.05, duration: 140 });
            btnReinicio.setFillStyle(0x4f46e5);
        });
        btnReinicio.on('pointerout', () => {
            this.tweens.add({ targets: btnReinicio, scaleX: 1, scaleY: 1, duration: 140 });
            btnReinicio.setFillStyle(0x6366f1);
        });
        btnReinicio.on('pointerdown', () => {
            GameState.reset();
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });
    }
}
