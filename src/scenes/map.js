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