# Joust – O Jogo do Cavalo

Joust é um jogo de estratégia para dois jogadores que utiliza apenas cavalos do xadrez em um tabuleiro 8x8.

É uma variação do tour do cavalo, com regras próprias, movimentos inteligentes e finalizações estratégicas.

## Regras do Jogo

- O jogo é disputado entre dois jogadores (White ♘ e Black ♞).
- Cada jogador tem um cavalo e eles se movem como no xadrez.
- Após um movimento, a casa de origem queima e não pode mais ser acessada.
- Os jogadores se revezam.
- Não é permitido pular sobre o cavalo do adversário.
- O objetivo é bloquear o adversário, impedindo-o de realizar qualquer jogada.

### Condições de Fim de Jogo

- Vitória: se o jogador adversário não tiver mais movimentos válidos.
- Empate: se nenhum dos dois jogadores puder se mover ao mesmo tempo.

## Tecnologias Utilizadas

- Node.js
- TypeScript
- WebSocket (ws)
- HTML5, CSS3 e JavaScript
- ts-node, nodemon, tsc


## Como Rodar Localmente

### 1. Clone o repositório

1. Clone repositório
git clone https://github.com/Larissamrs/joust.git
cd joust
2. Instale as dependências
npm install
3. Compile o frontend (client.ts)
npx tsc src/frontend/client.ts --outDir public
4. Inicie o servidor (modo desenvolvimento)
npm run dev
5. Acesse no navegador
Abra duas abas (ou dois navegadores diferentes):

http://localhost:3000

Como Jogar

O primeiro jogador será White (♘), o segundo será Black (♞).
O jogador White deve clicar em “Iniciar Partida”.
Cada jogador realiza jogadas alternadas.
O jogo termina em empate ou vitória.

Funcionalidades Implementadas
 Tabuleiro 8x8 com padrão xadrez

 Jogadores conectam via WebSocket

 Cavalos posicionados aleatoriamente

 Movimento válido de cavalo

 Casas queimadas após jogada

 Controle de turno

 Bloqueio de jogadas inválidas

 Detecção de empate

 Detecção de vitória

 Botão "Iniciar Partida" controlado por lógica

Autora
Desenvolvido por Larissamrs