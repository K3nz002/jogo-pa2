//
export class MapaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapaScene' });
    }

    init() {
        // Velocidade de movimento do policial
        this.velocidadePlayer = 200;
    }

    preload() {
        // Em um jogo real, você carregaria as imagens aqui:
        // this.load.image('chao', 'assets/tilesets/chao.png');
    }

    create() {
        // 1. CRIANDO UM CENÁRIO VISUAL SIMPLES (Representando a Delegacia)
        // Desenha um chão cinza escuro de 800x600
        this.add.grid(960, 540, 1920, 1080, 32, 32, 0x222222).setOrigin(0.5);

        // 2. CRIANDO O JOGADOR (O Policial)
        // Criamos um retângulo azul de 32x48 pixels para representar o personagem
        this.player = this.add.rectangle(960, 540, 32, 48, 0x0055ff);
        
        // Ativa a física do motor Arcade no jogador
        this.physics.add.existing(this.player);
        
        // Evita que o jogador saia das bordas da tela do jogo
        this.player.body.setCollideWorldBounds(true);

        // 3. CRIANDO UM OBSTÁCULO (Cena de Crime / Parede)
        // Criamos um retângulo vermelho para simular uma mesa ou parede com colisão
        this.obstaculo = this.add.rectangle(200, 200, 128, 64, 0xaa2222);
        this.physics.add.existing(this.obstaculo, true); // O 'true' define como objeto estático (não se move)

        // Adiciona a colisão física entre o jogador e o obstáculo
        this.physics.add.collider(this.player, this.obstaculo);

        // 4. CONFIGURANDO OS CONTROLES DO TECLADO
        // Cria um objeto que escuta as setas (Up, Down, Left, Right) e as teclas Space e Shift
        this.teclado = this.input.keyboard.createCursorKeys();

        // 5. TEXTO INDICATIVO DE INTERAÇÃO
        this.textoDica = this.add.text(16, 16, 'Use as SETAS para andar. Aproxime-se do bloco vermelho.', {
            fontSize: '16px',
            fill: '#ffffff'
        });
    }

    update() {
        // Reseta a velocidade do jogador a cada quadro (para ele parar se nenhuma tecla for pressionada)
        this.player.body.setVelocity(0);

        // CONTROLE HORIZONTAL (Esquerda / Direita)
        if (this.teclado.left.isDown) {
            this.player.body.setVelocityX(-this.velocidadePlayer);
        } else if (this.teclado.right.isDown) {
            this.player.body.setVelocityX(this.velocidadePlayer);
        }

        // CONTROLE VERTICAL (Cima / Baixo)
        if (this.teclado.up.isDown) {
            this.player.body.setVelocityY(-this.velocidadePlayer);
        } else if (this.teclado.down.isDown) {
            this.player.body.setVelocityY(this.velocidadePlayer);
        }

        // LÓGICA DE DETECÇÃO DE PROXIMIDADE (Para o Point-and-Click / Investigação)
        // Calcula a distância entre o policial e o bloco vermelho
        let distancia = Phaser.Math.Distance.Between(
            this.player.x, this.player.y, 
            this.obstaculo.x, this.obstaculo.y
        );

        // Se estiver perto do objeto (menos de 80 pixels), avisa que ele pode investigar
        if (distancia < 80) {
            this.textoDica.setText('Pressione ESPAÇO para examinar a pista.');
            
            // Verifica se o jogador apertou Espaço para "investigar"
            if (Phaser.Input.Keyboard.JustDown(this.teclado.space)) {
                this.investigarPista();
            }
        } else {
            this.textoDica.setText('Use as SETAS para andar. Aproxime-se do bloco vermelho.');
        }
    }

    investigarPista() {
        // Aqui seria o gatilho para pausar o mapa e abrir a tela de diálogo/ponto-e-clique
        alert("Você encontrou um documento rasgado em cima da mesa! (Transição para modo Point-and-Click)");
    }
}

// Cursor e interação
class MapaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapaScene' });
    }

    preload() {
        // --- 1. PRECARREGANDO AS IMAGENS DO CURSOR ---
        // Em um jogo real, você usaria arquivos .png na pasta assets
        // this.load.image('cursor_padrao', 'assets/cursores/seta.png');
        // this.load.image('cursor_interagir', 'assets/cursores/lupa.png');
        
        // Vamos usar placeholders de texto para simular o carregamento
        // (Isso é apenas para este exemplo funcionar sem arquivos externos)
        this.add.text(10, 10, 'Carregando cursores...', { fill: '#0f0' });
    }

    create() {
        // --- CONFIGURAÇÃO INICIAL (Física e Controles) ---
        this.physics.world.setBounds(0, 0, 800, 600);
        this.velocidadePlayer = 200;
        this.alcanceInteracao = 100; // Distância máxima (em pixels) para o policial interagir
        this.teclado = this.input.keyboard.createCursorKeys();

        // --- DEFININDO O CURSOR PADRÃO DO JOGO ---
        // Você pode usar CSS no Phaser para definir cursores customizados facilmente.
        // Substitua 'default' pelo caminho da sua imagem se tiver uma carregada.
        // Ex: `url(assets/cursores/seta.png), default`
        this.input.setDefaultCursor('default'); 

        // --- CENÁRIO (Delegacia) ---
        this.add.grid(400, 300, 800, 600, 32, 32, 0x222222).setOrigin(0.5);
        this.add.text(400, 20, 'Delegacia - Use as SETAS para andar e MOUSE para interagir', { fontSize: '18px' }).setOrigin(0.5);

        // --- O POLICIAL (Player) ---
        this.player = this.add.rectangle(400, 300, 32, 48, 0x0055ff);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // --- OBJETOS INTERATIVOS DO MAPA (Sistema Point-and-Click Stardew) ---
        
        // Objeto 1: Mesa de Evidências
        this.mesa = this.add.rectangle(200, 200, 96, 64, 0xaa2222); // Vermelho
        this.physics.add.existing(this.mesa, true);
        this.mesa.setData('id', 'mesa_evidencias'); // Dados customizados para identificar a pista
        this.mesa.setData('mensagem', 'Há um bilhete de ameaça amassado aqui.');
        this.mesa.setInteractive(); // <--- FUNDAMENTAL: Ativa o point-and-click

        // Objeto 2: Armário Trancado
        this.armario = this.add.rectangle(600, 400, 32, 96, 0x885522); // Marrom
        this.physics.add.existing(this.armario, true);
        this.armario.setData('id', 'armario_arquivos');
        this.armario.setData('mensagem', 'O armário de arquivos está trancado. Preciso da chave.');
        this.armario.setInteractive(); // <--- FUNDAMENTAL: Ativa o point-and-click

        // Colisões físicas normais
        this.physics.add.collider(this.player, [this.mesa, this.armario]);

        // --- LÓGICA DO CURSOR E CLIQUE (Mecânica SDV) ---

        // Grupo de objetos que podem ser inspecionados
        let objetosInspecionaveis = [this.mesa, this.armario];

        // 1. FEEDBACK VISUAL: Mudar cursor ao passar por cima
        objetosInspecionaveis.forEach(objeto => {
            objeto.on('pointerover', () => {
                // Quando o mouse passa por cima, mudamos o cursor.
                // Substitua 'pointer' pelo seu cursor customizado (lupa, etc)
                this.input.setDefaultCursor('pointer'); 
                
                // Feedback visual extra opcional: destaca o objeto
                objeto.setStrokeStyle(4, 0xffffff);
            });

            objeto.on('pointerout', () => {
                // Quando o mouse sai, volta ao cursor padrão do jogo
                this.input.setDefaultCursor('default');
                objeto.setStrokeStyle(); // Remove destaque
            });
        });

        // 2. AÇÃO DE CLIQUE: Point-and-Click com checagem de distância
        // Escutamos o clique do mouse no mundo do jogo, não em um objeto específico.
        this.input.on('pointerdown', (pointer, gameObjects) => {
            // Se 'gameObjects' tiver conteúdo, clicamos em algo interativo
            if (gameObjects.length > 0) {
                let objetoClicado = gameObjects[0]; // Pegamos o primeiro objeto clicado

                // CALCULANDO A DISTÂNCIA (Regra do Alcance)
                let distancia = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y, 
                    objetoClicado.x, objetoClicado.y
                );

                if (distancia <= this.alcanceInteracao) {
                    // SUCESSO: O policial está perto o suficiente!
                    this.realizarInvestigacao(objetoClicado);
                } else {
                    // FALHA: Muito longe
                    this.mostrarMensagemUI("Muito longe para examinar.");
                }
            }
        });

        // --- UI SIMPLES (Caixa de Texto) ---
        this.caixaUI = this.add.container(400, 550);
        let fundoUI = this.add.rectangle(0, 0, 700, 80, 0x000000, 0.8).setOrigin(0.5);
        this.textoUI = this.add.text(0, 0, '', { fontSize: '18px', fill: '#fff', align: 'center', wordWrap: { width: 650 } }).setOrigin(0.5);
        this.caixaUI.add([fundoUI, this.textoUI]);
        this.caixaUI.setVisible(false); // Escondida no início
    }

    update() {
        // Movimentação básica do policial
        this.player.body.setVelocity(0);
        if (this.teclado.left.isDown) this.player.body.setVelocityX(-this.velocidadePlayer);
        else if (this.teclado.right.isDown) this.player.body.setVelocityX(this.velocidadePlayer);
        if (this.teclado.up.isDown) this.player.body.setVelocityY(-this.velocidadePlayer);
        else if (this.teclado.down.isDown) this.player.body.setVelocityY(this.velocidadePlayer);
    }

    realizarInvestigacao(objeto) {
        // Pegamos os dados que definimos no objeto
        let id = objeto.getData('id');
        let mensagem = objeto.getData('mensagem');
        
        console.log(`Investigando: ${id}`);
        this.mostrarMensagemUI(mensagem);
        
        // Aqui você adicionaria a lógica real: 
        // ex: if (id === 'mesa_evidencias') inventario.add('bilhete');
    }

    mostrarMensagemUI(texto) {
        this.textoUI.setText(texto);
        this.caixaUI.setVisible(true);
        
        // Esconde a mensagem após 4 segundos automaticamente
        this.time.delayedCall(4000, () => {
            this.caixaUI.setVisible(false);
        });
    }
}