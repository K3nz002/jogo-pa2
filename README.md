# Jogo do curso projeto aplicado 2

## Descrição dos Arquivos
- assets/dialogos.json: Falas dos 3 NPCs por dia (dias 1, 2, 3)

- assets/pistas.json: 7 pistas + 1 puzzle com dados completos

- src/utils/GameState.js: Singleton de estado global (dia, tempo, 
inventário, pistas)

- src/utils/DialogoManager.js: Leitura dos JSONs com métodos tipados

- src/scenes/boot.js: Tela de loading + preload dos JSONs

- src/scenes/menu.js: Menu animado com intro da história

- src/scenes/map.js: Mapa completo com todas as mecânicas

- src/scenes/dialogue.js: Overlay de diálogo com NPCs

- src/scenes/inventory.js: Inventário + Caderno de Anotações (2 abas)

- src/scenes/puzzle.js: Teclado numérico para senha do computador

- src/scenes/julgamento.js: Cena final + 4 finais possíveis

- src/main.js: Registra todas as 7 cenas

- index.html: Título, meta tags SEO, canvas responsivo

## Sistemas Implementados

### Roteiro e Diálogos JSON
- Estrutura JSON com falas por NPC e por dia
- DialogoManager para leitura segura do cache Phaser
- História: assassinato de Carlos Vilanova, 3 suspeitos

### Core Loop (Point-and-Click)
- Clique nos objetos destaca e coleta pistas no caderno
- 7 objetos interativos distribuídos pelo mapa
- Sistema de inventário no GameState
- Caderno de anotações abre com I ou N
- Puzzle de senha (computador) com teclado numérico

### Movimentação
- 4 direções com Setas ou WASD
- Normalização de movimento diagonal
- Física Arcade com colisões (móveis, paredes)
- Câmera com deadzone suave seguindo o player

### Sistema de Tempo e Progressão
- HUD fixo com: Dia X/3, Hora HH:00, ⚡ Ações Restantes
- Cada ação gasta 2 horas do dia
- Dia avança automaticamente ao esgotar ações
- NPCs têm falas diferentes por dia
- Objetos aparecem só no dia adequado (dia-gating)
- Ao avançar dia: fade out → fade in, player volta à delegacia

### Dia do Julgamento
- Tela final com pistas coletadas + 3 suspeitos para acusar

### 4 finais:
- 🏆 Verdadeiro — acusou o culpado com ≥2 provas
- ⚠️ Sem Provas — acusou o culpado mas sem evidências
- ❌ Errado — acusou inocente
- 📁 Inconclusivo — não acusou ninguém

## Como Jogar

#### Ação de Mover
- Tecla/Botão: Setas ou WASD
#### Ação de Interagir com objeto/NPC
- Tecla/Botão: Clique esquerdo
#### Ação de Abrir Inventário
- Tecla/Botão: Tecla i
#### Ação de Abrir Caderno
- Tecla/Botão: Tecla N
#### Ação de Ir ao Julgamento (Dia 3)
- Tecla/Botão: Tecla J ou botão HUD
#### Ação de Avançar diálogo
- Tecla/Botão: Clique ou Espaço
#### Tecla de Fechar overlay: ESC

## Servidor Local
O servidor PowerShell está rodando em http://localhost:8080.

Para reiniciar o servidor manualmente:

## powershell

powershell -ExecutionPolicy Bypass -File "C:\Users\guilherme.fujimura_u\.gemini\antigravity-ide\brain\8c596bd7-0ce4-4f38-ae09-6767fda07b8c\scratch\serve.ps1" -Folder "c:\Users\guilherme.fujimura_u\Documents\GitHub\jogo-pa2" -Port 808