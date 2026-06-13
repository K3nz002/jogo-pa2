//
export class MapaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapaScene' });
    }

    init() {
        this.velocidadePlayer = 200;
        this.alcanceInteracao = 100;

        this.duranteDialogo = false;
        this.dialogoAtivo = [];
        this.indexLinhaDialogo = 0;
    }

    preload() {
        // Carregar os arquivos do jogo:
        // this.load.image('exemplo', 'assets/tilesets/chao.png');

        // this.load.json('dialogos', 'assets/dialogos.json');
    }

    create() {
        this.physics.world.setBounds(0, 0, 1920, 1080);
        this.teclado = this.input.keyboard.createCursorKeys();
        this.input.setDefaultCursor("default")
        
        // CRIANDO UM CENÁRIO VISUAL SIMPLES (Representando a Delegacia)
        this.add.grid(960, 540, 1920, 1080, 32, 32, 0x222222).setOrigin(0.5);

        // CRIANDO O JOGADOR (O Policial)
        this.player = this.add.rectangle(960, 540, 32, 48, 0x0055ff);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Carregando os diálogos do arquivo JSON
        const dialogosCarregados = this.cache.json.get('banco_dialogos');

        // Criando suspeito:
        this.suspeito = this.add.rectangle(500, 200, 32, 48, 0x22aa22);
        this.physics.add.existing(this.suspeito, true); // Estático
        this.suspeito.setData('id', 'suspeito_marido');
        this.suspeito.setInteractive();
        this.physics.add.collider(this.player, this.suspeito);

        // Dialogo
        // this.suspeito.setData("falas", dialogosCarregados.suspeito);
        
        this.input.on('pointerdown', (pointer, gameObjects) => {
            // Se já estiver em diálogo, o clique avança a fala
            if (this.duranteDialogo) {
                this.avancarDialogo();
                return;
            }

            if (gameObjects.length > 0) {
                let objetoClicado = gameObjects[0];
                let distancia = Phaser.Math.Distance.Between(this.player.x, this.player.y, objetoClicado.x, objetoClicado.y);

                if (distancia <= this.alcanceInteracao) {
                    if (objetoClicado.getData('id') === 'suspeito_marido') {
                        this.iniciarDialogo(objetoClicado.getData('falas'));
                    }
                } else {
                    this.mostrarMensagemTemporaria("Muito longe para conversar.");
                }
            }
        });


        // Caixa de Dialogo
        this.caixaUI = this.add.container(400, 520);
        let fundoUI = this.add.rectangle(0, 0, 740, 110, 0x000000, 0.95).setOrigin(0.5);
        fundoUI.setStrokeStyle(2, 0xffffff); // Borda branca estilo retrô

        this.textoUI = this.add.text(-350, -35, '', { 
            fontSize: '18px', 
            fill: '#fff', 
            wordWrap: { width: 700 } 
        });
        
        this.caixaUI.add([fundoUI, this.textoUI]);
        this.caixaUI.setVisible(false);



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

        // Otimização: Se estiver em diálogo, não processa movimento.
        if (this.duranteDialogo) return;

        // Movimentação básica (usando setVelocity para melhor integração com Arcade Physics)
        if (this.teclado.left.isDown) this.player.body.setVelocityX(-this.velocidadePlayer);
        else if (this.teclado.right.isDown) this.player.body.setVelocityX(this.velocidadePlayer);
        if (this.teclado.up.isDown) this.player.body.setVelocityY(-this.velocidadePlayer);
        else if (this.teclado.down.isDown) this.player.body.setVelocityY(this.velocidadePlayer);
    

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
        // Em um jogo real, você usaria arquivos .png na pasta assets
        // this.load.image('cursor_padrao', 'assets/cursores/seta.png');
        // this.load.image('cursor_interagir', 'assets/cursores/lupa.png');
        
        alert("Você encontrou uma pista!");
    }
    
    // Método para iniciar o diálogo com o NPC
    iniciarDialogo(falas) {
            this.duranteDialogo = true;
            this.dialogoAtual = falas;
            this.indexLinhaAtual = 0;
            this.caixaUI.setVisible(true);
            this.input.setDefaultCursor('default');
            
            // Exibe a primeira frase
            this.textoUI.setText(this.dialogoAtual[this.indexLinhaAtual]);
        }

    avancarDialogo() {
        this.indexLinhaAtual++;

        // Se ainda houver falas no array, mostra a próxima
        if (this.indexLinhaAtual < this.dialogoAtual.length) {
            this.textoUI.setText(this.dialogoAtual[this.indexLinhaAtual]);
        } else {
            // Se as falas acabaram, encerra o modo diálogo
            this.duranteDialogo = false;
            this.caixaUI.setVisible(false);
        }
    }

    mostrarMensagemTemporaria(texto) {
        this.textoUI.setText(texto);
        this.caixaUI.setVisible(true);
        this.time.delayedCall(2000, () => {
            if (!this.duranteDialogo) this.caixaUI.setVisible(false);
        });
    }
}
