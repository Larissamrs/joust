const boardElement = document.getElementById("board")!;
const messageElement = document.getElementById("message")!;
const startButton = document.getElementById("startButton")!;

const BOARD_SIZE = 8;
let socket: WebSocket;

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
            boardElement.appendChild(cell);
        }
    }
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

        if (data.type === "welcome") {
            console.log("🎉", data.message);
            setMessage(data.message);
        }

        if (data.type === "state") {
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
        console.warn("🔌 Conexão WebSocket encerrada.");
        startButton.setAttribute("disabled", "true");
        setMessage("Conexão encerrada. Atualize a página.");
    });
}

startButton.addEventListener("click", () => {
    if (socket.readyState === WebSocket.OPEN) {
        console.log("Enviando comando: iniciar partida");
        socket.send(JSON.stringify({ type: "start" }));
    } else {
        console.warn("WebSocket ainda não conectado");
        setMessage("Aguarde conexão com o servidor...");
    }
});


createBoard();
setMessage("Conectando ao servidor...");
startButton.setAttribute("disabled", "true");
connectToServer();

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