const boardElement = document.getElementById("board")!;
const messageElement = document.getElementById("message")!;
const startButton = document.getElementById("startButton")!;
const yourSideElement = document.getElementById("yourSide")!;

const BOARD_SIZE = 8;
let socket: WebSocket;
let selectedCell: HTMLElement | null = null;
let validMoves: { x: number; y: number }[] = [];
let gameState: any = null;
let playerId: 'white' | 'black';
let burned: { x: number; y: number }[] = [];

function handleCellClick(x: number, y: number) {
    const currentPlayer = gameState?.currentPlayer;
    const myPosition = gameState?.positions[playerId];

    if (!gameState || currentPlayer !== playerId) return;

    if (myPosition.x === x && myPosition.y === y) {
        selectedCell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        highlightValidMoves(x, y);
    } else if (validMoves.some(pos => pos.x === x && pos.y === y)) {
        socket.send(JSON.stringify({
            type: 'move',
            to: { x, y }
        }));
        clearHighlights();
    } else {
        clearHighlights();
    }
}

function createBoard() {
    boardElement.innerHTML = "";

    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            if ((x + y) % 2 === 1) {
                cell.classList.add("black");
            }

            cell.dataset.x = x.toString();
            cell.dataset.y = y.toString();
            cell.addEventListener("click", () => handleCellClick(x, y));

            boardElement.appendChild(cell);
        }
    }
}

function highlightValidMoves(x: number, y: number) {
    validMoves = getKnightMoves(x, y);
    validMoves.forEach(pos => {
        const cell = document.querySelector(`.cell[data-x="${pos.x}"][data-y="${pos.y}"]`);
        if (cell) cell.classList.add("highlight");
    });
}

function clearHighlights() {
    document.querySelectorAll('.cell.highlight').forEach(cell => {
        cell.classList.remove("highlight");
    });
    validMoves = [];
    selectedCell = null;
}

function getKnightMoves(x: number, y: number): { x: number; y: number }[] {
    const moves = [
        { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 2, y: -1 }, { x: 1, y: -2 },
        { x: -1, y: -2 }, { x: -2, y: -1 }, { x: -2, y: 1 }, { x: -1, y: 2 },
    ];

    return moves
        .map(m => ({ x: x + m.x, y: y + m.y }))
        .filter(pos =>
            pos.x >= 0 && pos.x < BOARD_SIZE &&
            pos.y >= 0 && pos.y < BOARD_SIZE &&
            !burned.some(b => b.x === pos.x && b.y === pos.y) &&
            !(
                (pos.x === gameState.positions.white.x && pos.y === gameState.positions.white.y) ||
                (pos.x === gameState.positions.black.x && pos.y === gameState.positions.black.y)
            )
        );
}

function setMessage(text: string) {
    messageElement.textContent = text;
}

function connectToServer() {
    socket = new WebSocket("ws://localhost:8080");

    socket.addEventListener("open", () => {
        console.log("Conectado ao servidor WebSocket!");
        startButton.removeAttribute("disabled");
    });

    socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "welcome" && !playerId) {
            playerId = data.playerId;
            yourSideElement.textContent = `Você é o jogador: ${playerId === 'white' ? '♘ (white)' : '♞ (black)'}`;
            setMessage(data.message);
        }

        if (data.type === "state") {
            gameState = data.state;
            burned = data.state.burned;
            updateBoardFromState(data.state);
        }

        if (data.type === "error") {
            setMessage(`Erro: ${data.message}`);
        }
    });

    socket.addEventListener("error", (err) => {
        console.error("Erro na conexão WebSocket", err);
        setMessage("Erro ao conectar com o servidor.");
    });

    socket.addEventListener("close", () => {
        console.warn("Conexão WebSocket encerrada.");
        startButton.setAttribute("disabled", "true");
        setMessage("Conexão encerrada. Atualize a página.");
    });
}

startButton.addEventListener("click", () => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "start" }));
    } else {
        setMessage("Aguardando conexão com o servidor...");
    }
});

function updateBoardFromState(state: any) {
    createBoard();

    const posWhite = state.positions.white;
    const posBlack = state.positions.black;

    const whiteCell = document.querySelector(`.cell[data-x="${posWhite.x}"][data-y="${posWhite.y}"]`);
    const blackCell = document.querySelector(`.cell[data-x="${posBlack.x}"][data-y="${posBlack.y}"]`);

    if (whiteCell) {
        whiteCell.textContent = '♘';
        whiteCell.classList.add('knight-white');
    }

    if (blackCell) {
        blackCell.textContent = '♞';
        blackCell.classList.add('knight-black');
    }

    const current = state.currentPlayer === 'white' ? '♘ (white)' : '♞ (black)';
    setMessage(`Vez de jogar: ${current}`);
}

createBoard();
setMessage("Conectando ao servidor...");
startButton.setAttribute("disabled", "true");
connectToServer();