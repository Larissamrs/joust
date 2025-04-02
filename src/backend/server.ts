import { createServer } from 'http';
import { WebSocketServer, WebSocket, RawData } from 'ws';

const server = createServer();
const wss = new WebSocketServer({ server });

let players: WebSocket[] = [];

wss.on('connection', (ws: WebSocket) => {
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: 'error', message: 'Jogo cheio! ❌' }));
    ws.close();
    return;
  }

  players.push(ws);
  const playerId = players.length === 1 ? 'white' : 'black';

  console.log(`Novo jogador conectado: ${playerId}`);

  ws.send(
    JSON.stringify({
      type: 'welcome',
      playerId,
      message: `Bem-vindo ao Joust! Você é o jogador ${playerId}. 🐴`,
    })
  );

  ws.on('message', (message: RawData) => {
    const data = JSON.parse(message.toString());

  });

  ws.on('close', () => {
    console.log(`Jogador ${playerId} desconectado`);
    players = players.filter((p) => p !== ws);
  });
});

server.listen(8080, () => {
  console.log("Servidor WebSocket do Joust rodando em http://localhost:8080 💬");
});