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
  burned: Position[];
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

function getOpponent(player: PlayerID): PlayerID {
  return player === 'white' ? 'black' : 'white';
}

function isBurned(pos: Position): boolean {
  return gameState?.burned.some(p => p.x === pos.x && p.y === pos.y) ?? false;
}

function isValidKnightMove(from: Position, to: Position): boolean {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
}

function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
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
        burned: [],
        currentPlayer: 'white'
      };

      broadcastGameState();
    }

    if (data.type === 'move') {
      if (!gameState) return;

      const player = players.find(p => p.ws === ws);
      if (!player || player.id !== gameState.currentPlayer) return;

      const from = gameState.positions[player.id];
      const to = data.to as Position;

      // Valida movimento
      if (
        !isValidKnightMove(from, to) ||
        isBurned(to) ||
        positionsEqual(to, gameState.positions[getOpponent(player.id)])
      ) {
        console.log(`⛔️ Movimento inválido por ${player.id}`);
        return;
      }

      // Movimento válido
      console.log(`✅ ${player.id} moveu de (${from.x},${from.y}) para (${to.x},${to.y})`);

      gameState.burned.push(from); // Queima a casa anterior
      gameState.positions[player.id] = to;
      gameState.currentPlayer = getOpponent(player.id);

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