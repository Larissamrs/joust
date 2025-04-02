var boardElement = document.getElementById("board");
var messageElement = document.getElementById("message");
var startButton = document.getElementById("startButton");
var BOARD_SIZE = 8;
var socket;
function createBoard() {
    boardElement.innerHTML = "";
    for (var y = 0; y < BOARD_SIZE; y++) {
        for (var x = 0; x < BOARD_SIZE; x++) {
            var cell = document.createElement("div");
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
function setMessage(text) {
    messageElement.textContent = text;
}
function connectToServer() {
    socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("open", function () {
        console.log("Conectado ao servidor WebSocket!");
        startButton.removeAttribute("disabled");
    });
    socket.addEventListener("message", function (event) {
        var data = JSON.parse(event.data);
        if (data.type === "welcome") {
            console.log("🎉", data.message);
            setMessage(data.message);
        }
        if (data.type === "state") {
            updateBoardFromState(data.state);
        }
        if (data.type === "error") {
            setMessage("Erro: ".concat(data.message));
        }
    });
    socket.addEventListener("error", function (err) {
        console.error("Erro na conexão WebSocket", err);
        setMessage("Erro ao conectar com o servidor.");
    });
    socket.addEventListener("close", function () {
        console.warn("🔌 Conexão WebSocket encerrada.");
        startButton.setAttribute("disabled", "true");
        setMessage("Conexão encerrada. Atualize a página.");
    });
}
startButton.addEventListener("click", function () {
    if (socket.readyState === WebSocket.OPEN) {
        console.log("Enviando comando: iniciar partida");
        socket.send(JSON.stringify({ type: "start" }));
    }
    else {
        console.warn("WebSocket ainda não conectado");
        setMessage("Aguarde conexão com o servidor...");
    }
});
createBoard();
setMessage("Conectando ao servidor...");
startButton.setAttribute("disabled", "true");
connectToServer();
function updateBoardFromState(state) {
    createBoard();
    var posWhite = state.positions.white;
    var posBlack = state.positions.black;
    var whiteCell = document.querySelector(".cell[data-x=\"".concat(posWhite.x, "\"][data-y=\"").concat(posWhite.y, "\"]"));
    var blackCell = document.querySelector(".cell[data-x=\"".concat(posBlack.x, "\"][data-y=\"").concat(posBlack.y, "\"]"));
    if (whiteCell) {
        whiteCell.textContent = '♘';
        whiteCell.classList.add('knight-white');
    }
    if (blackCell) {
        blackCell.textContent = '♞';
        blackCell.classList.add('knight-black');
    }
    var current = state.currentPlayer === 'white' ? '♘ (white)' : '♞ (black)';
    setMessage("Vez de jogar: ".concat(current));
}
