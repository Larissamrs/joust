var boardElement = document.getElementById("board");
var messageElement = document.getElementById("message");
var startButton = document.getElementById("startButton");
var yourSideElement = document.getElementById("yourSide");
var BOARD_SIZE = 8;
var socket;
var selectedCell = null;
var validMoves = [];
var gameState = null;
var playerId;
var burned = [];
function handleCellClick(x, y) {
    var currentPlayer = gameState === null || gameState === void 0 ? void 0 : gameState.currentPlayer;
    var myPosition = gameState === null || gameState === void 0 ? void 0 : gameState.positions[playerId];
    if (!gameState || currentPlayer !== playerId)
        return;
    if (myPosition.x === x && myPosition.y === y) {
        selectedCell = document.querySelector(".cell[data-x=\"".concat(x, "\"][data-y=\"").concat(y, "\"]"));
        highlightValidMoves(x, y);
    }
    else if (validMoves.some(function (pos) { return pos.x === x && pos.y === y; })) {
        socket.send(JSON.stringify({
            type: 'move',
            to: { x: x, y: y }
        }));
        clearHighlights();
    }
    else {
        clearHighlights();
    }
}
function createBoard() {
    boardElement.innerHTML = "";
    var _loop_1 = function (y) {
        var _loop_2 = function (x) {
            var cell = document.createElement("div");
            cell.classList.add("cell");
            if ((x + y) % 2 === 1) {
                cell.classList.add("black");
            }
            cell.dataset.x = x.toString();
            cell.dataset.y = y.toString();
            cell.addEventListener("click", function () { return handleCellClick(x, y); });
            boardElement.appendChild(cell);
        };
        for (var x = 0; x < BOARD_SIZE; x++) {
            _loop_2(x);
        }
    };
    for (var y = 0; y < BOARD_SIZE; y++) {
        _loop_1(y);
    }
}
function highlightValidMoves(x, y) {
    validMoves = getKnightMoves(x, y);
    validMoves.forEach(function (pos) {
        var cell = document.querySelector(".cell[data-x=\"".concat(pos.x, "\"][data-y=\"").concat(pos.y, "\"]"));
        if (cell)
            cell.classList.add("highlight");
    });
}
function clearHighlights() {
    document.querySelectorAll('.cell.highlight').forEach(function (cell) {
        cell.classList.remove("highlight");
    });
    validMoves = [];
    selectedCell = null;
}
function getKnightMoves(x, y) {
    var moves = [
        { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 2, y: -1 }, { x: 1, y: -2 },
        { x: -1, y: -2 }, { x: -2, y: -1 }, { x: -2, y: 1 }, { x: -1, y: 2 },
    ];
    return moves
        .map(function (m) { return ({ x: x + m.x, y: y + m.y }); })
        .filter(function (pos) {
        return pos.x >= 0 && pos.x < BOARD_SIZE &&
            pos.y >= 0 && pos.y < BOARD_SIZE &&
            !burned.some(function (b) { return b.x === pos.x && b.y === pos.y; }) &&
            !((pos.x === gameState.positions.white.x && pos.y === gameState.positions.white.y) ||
                (pos.x === gameState.positions.black.x && pos.y === gameState.positions.black.y));
    });
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
        if (data.type === "welcome" && !playerId) {
            playerId = data.playerId;
            yourSideElement.textContent = "Voc\u00EA \u00E9 o jogador: ".concat(playerId === 'white' ? '♘ (white)' : '♞ (black)');
            setMessage(data.message);
        }
        if (data.type === "state") {
            gameState = data.state;
            burned = data.state.burned;
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
        console.warn("Conexão WebSocket encerrada.");
        startButton.setAttribute("disabled", "true");
        setMessage("Conexão encerrada. Atualize a página.");
    });
}
startButton.addEventListener("click", function () {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "start" }));
    }
    else {
        setMessage("Aguardando conexão com o servidor...");
    }
});
function updateBoardFromState(state) {
    createBoard();
    var posWhite = state.positions.white;
    var posBlack = state.positions.black;
    // Renderiza casas queimadas
    state.burned.forEach(function (b) {
        var burnedCell = document.querySelector(".cell[data-x=\"".concat(b.x, "\"][data-y=\"").concat(b.y, "\"]"));
        if (burnedCell)
            burnedCell.classList.add("burned");
    });
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
createBoard();
setMessage("Conectando ao servidor...");
startButton.setAttribute("disabled", "true");
connectToServer();
