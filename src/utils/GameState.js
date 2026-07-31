/**
 * GameState.js — Estado Global do Jogo
 * Singleton que controla: dia, tempo, inventário, pistas, interrogatórios e progressão.
 */
export const GameState = {
    diaAtual: 1,
    maxDias: 3,
    horaAtual: 8,
    acoesHoje: 0,
    maxAcoesPorDia: 5,
    _fimDiaAgendado: false, // evita múltiplos fim-de-dia

    inventario: [],       // IDs de itens coletados
    pistasAnotadas: [],   // IDs de pistas anotadas no caderno
    anotacoesInterrogatorios: [], // { npcId, npcNome, dia, pontoChave }
    interrogados: {},     // { npcId: [dia1, dia2, ...] }
    flags: {},            // flags de eventos genéricos

    criminosoVerdadeiro: 'marco',


    //  Verificações

    temItem(id) {
        return this.inventario.includes(id);
    },

    temPista(id) {
        return this.pistasAnotadas.includes(id);
    },

    jaDinterrogadoHoje(npcId) {
        if (!this.interrogados[npcId]) return false;
        return this.interrogados[npcId].includes(this.diaAtual);
    },


    //  Mutações

    adicionarItem(id) {
        if (!this.temItem(id)) {
            this.inventario.push(id);
            return true;
        }
        return false;
    },

    anotarPista(id) {
        if (!this.temPista(id)) {
            this.pistasAnotadas.push(id);
            return true;
        }
        return false;
    },

    registrarInterrogatorio(npcId) {
        if (!this.interrogados[npcId]) this.interrogados[npcId] = [];
        if (!this.jaDinterrogadoHoje(npcId)) {
            this.interrogados[npcId].push(this.diaAtual);
        }
    },

    /**
     * Registra uma anotação-chave de um interrogatório.
     * @param {string} npcId
     * @param {string} npcNome
     * @param {number} dia
     * @param {string} pontoChave - Resumo do ponto importante
     */
    registrarAnotacaoInterrogatorio(npcId, npcNome, dia, pontoChave) {
        this.anotacoesInterrogatorios.push({ npcId, npcNome, dia, pontoChave });
    },

    /**
     * Retorna todas as anotações de interrogatórios.
     * @returns {Array}
     */
    getAnotacoesInterrogatorios() {
        return this.anotacoesInterrogatorios;
    },

    /**
     * Verifica se o jogador ainda pode realizar ações.
     * Retorna false se ações esgotadas OU se já são 22h ou mais.
     */
    podeAgir() {
        return this.acoesHoje < this.maxAcoesPorDia && this.horaAtual < 22;
    },

    /**
     * Gasta uma ação e avança o tempo.
     * @returns {boolean} true se o dia deve encerrar (primeira vez)
     */
    gastarAcao() {
        this.acoesHoje++;
        this.horaAtual += 2;
        const deveFinalizar = this.horaAtual >= 22 || this.acoesHoje >= this.maxAcoesPorDia;
        if (deveFinalizar && !this._fimDiaAgendado) {
            this._fimDiaAgendado = true;
            return true;
        }
        return false;
    },

    avancarDia() {
        this.diaAtual++;
        this.horaAtual = 8;
        this.acoesHoje = 0;
        this._fimDiaAgendado = false;
    },

    //  Formatação

    getHoraFormatada() {
        return `${String(this.horaAtual).padStart(2, '0')}:00`;
    },

    getDiaTexto() {
        return `Dia ${this.diaAtual} de ${this.maxDias}`;
    },

    getAcoesRestantes() {
        return Math.max(0, this.maxAcoesPorDia - this.acoesHoje);
    },

    //  Julgamento Final
    /**
     * Calcula o resultado do julgamento com base no acusado e nas provas.
     * @param {string|null} acusadoId - ID do suspeito acusado, ou null para inconclusivo.
     * @returns {'verdadeiro'|'sem_provas'|'errado'|'inconclusivo'}
     */
    calcularFinal(acusadoId) {
        if (!acusadoId) return 'inconclusivo';

        const pistasChave = ['carta_ameaca', 'extrato_bancario', 'frasco_veneno', 'digital_marco', 'agenda_reuniao'];
        const pistasColetadas = pistasChave.filter(p => this.temPista(p));

        if (acusadoId === this.criminosoVerdadeiro) {
            return pistasColetadas.length >= 2 ? 'verdadeiro' : 'sem_provas';
        }
        return 'errado';
    },

    //  Reset
    
    reset() {
        this.diaAtual = 1;
        this.horaAtual = 8;
        this.acoesHoje = 0;
        this._fimDiaAgendado = false;
        this.inventario = [];
        this.pistasAnotadas = [];
        this.anotacoesInterrogatorios = [];
        this.interrogados = {};
        this.flags = {};
    }
};
