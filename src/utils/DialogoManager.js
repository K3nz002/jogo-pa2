/**
 * DialogoManager.js — Gerenciador de Diálogos e Pistas
 * Lê os dados dos JSONs carregados no cache do Phaser e fornece
 * métodos de consulta para as cenas do jogo.
 */
export class DialogoManager {
    /**
     * @param {Phaser.Scene} scene - Cena Phaser com acesso ao cache compartilhado.
     */
    constructor(scene) {
        this.scene = scene;
        this._dialogos = scene.cache.json.get('dialogos');
        this._pistas = scene.cache.json.get('pistas');
    }

    //  Diálogos de NPC

    /**
     * Retorna o array de falas de um NPC para um determinado dia.
     * @param {string} npcId
     * @param {number} dia
     * @returns {string[]}
     */
    getFalas(npcId, dia) {
        const diaStr = String(dia);
        const npc = this._dialogos?.npcs?.[npcId];
        if (!npc) return [`[${npcId}]: (NPC não encontrado nos dados)`];
        const falas = npc.falas?.[diaStr];
        if (!falas || falas.length === 0) return [`${npc.nome}: (sem diálogo para o dia ${dia})`];
        return falas;
    }

    /**
     * Retorna o nome de exibição de um NPC.
     * @param {string} npcId
     * @returns {string}
     */
    getNomeNPC(npcId) {
        return this._dialogos?.npcs?.[npcId]?.nome || npcId;
    }

    //  Pistas
    
    /**
     * Retorna os dados completos de uma pista.
     * @param {string} pistaId
     * @returns {object|null}
     */
    getPistaDados(pistaId) {
        return this._pistas?.pistas?.[pistaId] || null;
    }

    /**
     * Retorna os dados completos de um puzzle.
     * @param {string} puzzleId
     * @returns {object|null}
     */
    getPuzzleDados(puzzleId) {
        return this._pistas?.puzzles?.[puzzleId] || null;
    }

    /**
     * Retorna todas as pistas disponíveis para um dado dia.
     * @param {number} dia
     * @returns {object[]}
     */
    getPistasDisponiveis(dia) {
        const pistas = this._pistas?.pistas || {};
        return Object.values(pistas).filter(p => p.diaDisponivel <= dia);
    }

    /**
     * Retorna todos os dados de pistas coletadas pelo jogador.
     * @param {string[]} ids - Array de IDs de pistas coletadas (de GameState)
     * @returns {object[]}
     */
    getPistasColetadas(ids) {
        return ids
            .map(id => this.getPistaDados(id))
            .filter(Boolean);
    }
}
