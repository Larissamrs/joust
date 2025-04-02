import { createServer } from 'http';
import { WebSocketServer, WebSocket, RawData } from 'ws';

const server = createServer();
const wss = new WebSocketServer({ server });

type PlayerID = 'white' | 'black';

interface Position {
  x: number;
  y: number;
}

interface GameState {
  positions: Record<PlayerID, Position>;
  currentPlayer: PlayerID;
}

let players: { ws: WebSocket; id: PlayerID }[] = [];
let gameState: GameState | null = null;

function getRandomPosition(exclude?: Position): Position {
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * 8),
      y: Math.floor(Math.random() * 8),
    };
  } while (exclude && pos.x === exclude.x && pos.y === exclude.y);
  return pos;
}

function broadcastGameState() {
  players.forEach(({ ws }) => {
    ws.send(JSON.stringify({
      type: 'state',
      state: gameState
    }));
  });
}

wss.on('connection', (ws: WebSocket) => {
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: 'error', message: 'Jogo cheio! ❌' }));
    ws.close();
    return;
  }

  const playerId: PlayerID = players.length === 0 ? 'white' : 'black';
  players.push({ ws, id: playerId });

  console.log(`Novo jogador conectado: ${playerId}`);

  ws.send(JSON.stringify({
    type: 'welcome',
    playerId,
    message: `Bem-vindo ao Joust! Você é o jogador ${playerId}. 🐴`,
  }));

  ws.on('message', (message: RawData) => {
    const data = JSON.parse(message.toString());

    if (data.type === 'start') {
      console.log('📢 Partida iniciada! Sorteando posições...');

      const posWhite = getRandomPosition();
      const posBlack = getRandomPosition(posWhite);

      gameState = {
        positions: {
          white: posWhite,
          black: posBlack
        },
        currentPlayer: 'white'
      };

      broadcastGameState();
    }
  });

  ws.on('close', () => {
    console.log(`Jogador ${playerId} desconectado`);
    players = players.filter(p => p.ws !== ws);
    gameState = null;
  });
});

server.listen(8080, () => {
  console.log('Servidor WebSocket do Joust rodando em http://localhost:8080 💬');
});