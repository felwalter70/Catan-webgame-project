import { io } from "./socket.io.esm.min.js";

const socket = io("http://localhost:3000", {
    withCredentials: true
});

//SEPARAR DEPOIS -> PARTE DAS SALAS

let botaoStartEl = document.querySelector(".btn-start");
let bodyEl = document.querySelector("body");

let botaoJoinMatch = document.querySelector(".btn-get-info");
let inputJoinMatch = document.querySelector(".input-join-match");

let checkboxNodeVisEl = document.querySelector(".check-node-vis");

let matchId = "";
let userId = "";
let actualMatchInfo;

function geraMatch() {
    socket.emit("gera-match");
    botaoStartEl.removeEventListener("click", geraMatch);
}

botaoStartEl.addEventListener("click", geraMatch);

botaoJoinMatch.addEventListener("click", () => {
    matchId = inputJoinMatch.value;

    socket.emit("get-match-info", matchId);
});

let boardEl = document.querySelector(".board");
let tileContainerEl = boardEl.querySelector(".tile-container");
let placeHolderTileEl = document.querySelector(".board-tile");

function posicionaTiles(vetorTiles) {
    for (let i = 0, limite = 3, k = 0; i < 7; i++) {
        let topPos = (((placeHolderTileEl.clientHeight) * 0.7421875) * i) + ((boardEl.clientHeight) - ((placeHolderTileEl.clientHeight) + (6 * (placeHolderTileEl.clientHeight) * 0.7421875))) / 2;

        for (let j = 0; j < limite; j++) {
            //console.log("tile atual -> ", vetorTiles[k]);

            let newTileEl = document.createElement("div");
            newTileEl.style.backgroundImage = `url(/imgs/tiles/${vetorTiles[k].type}Tile.png)`;
            newTileEl.classList.add("board-tile");

            let numTileEl = document.createElement("span");
            numTileEl.innerHTML = vetorTiles[k].number;
            numTileEl.classList.add("tile-num");

            if (vetorTiles[k].bandit)
                newTileEl.classList.add("bandit-tile")

            newTileEl.appendChild(numTileEl);
            tileContainerEl.appendChild(newTileEl);

            let leftPos = ((boardEl.clientWidth) - ((placeHolderTileEl.clientWidth) * limite)) / 2;

            //console.log("C1 -> ", leftPos);

            leftPos += (placeHolderTileEl.clientWidth) * j;

            //console.log("C2 -> ", leftPos);

            newTileEl.style.left = leftPos.toString() + "px";
            newTileEl.style.top = topPos.toString() + "px";

            k++;
        }
        
        if (i < 3) {
            limite++;
        }
        else {
            limite--;
        }
    }

    placeHolderTileEl.remove();
}

function posicionaNodes(matchTiles) {
    let TilesElNode = document.querySelectorAll(".board-tile");
    let tileAtual = 0;
    let vCorecaoIndices = [1, 2, 5, 4, 3, 0]

    TilesElNode.forEach(tile => {
        let rect = tile.getBoundingClientRect();

        let positions = [
            {x: rect.left + (tile.clientWidth / 2), y: rect.top},
            {x: rect.right, y: rect.bottom + ((rect.top - rect.bottom) / 9) * 6.72},
            {x: rect.right, y: rect.bottom + ((rect.top - rect.bottom) / 9) * 2.28},
            {x: (rect.right + rect.left) / 2, y: rect.bottom},
            {x: rect.left, y: rect.bottom + ((rect.top - rect.bottom) / 9) * 2.28},
            {x: rect.left, y: rect.bottom + ((rect.top - rect.bottom) / 9) * 6.72},
        ]

        for (let i = 0; i < 6; i++) {
            let newTileNode = document.createElement("div");
            newTileNode.classList.add("tile-node");
            newTileNode.dataset.nodeId = matchTiles[tileAtual].nodes[vCorecaoIndices[i]];
            bodyEl.appendChild(newTileNode);

            let height = newTileNode.clientHeight;
            let width = newTileNode.clientWidth;

            //console.log("POST -> ", positions[i], positions[i].x, positions[i].y);
            newTileNode.style.left = (positions[i].x - width / 2) + "px";
            newTileNode.style.top = (positions[i].y - height / 2) + "px";
        }
        tileAtual++;
    });
}

function toggleDisplay(element) {
    element.classList.toggle("display")
}

async function parseMatchInfos(matchInfo) {
    matchInfo.matchTiles.forEach(tile => {
        tile.nodes = JSON.parse(tile.nodes);
    });

    console.log("Match tiles parse => ", matchInfo.matchTiles);
}

//Conexão via socket
socket.on("connect", () => {
    socket.emit("connect-match");
});

//mensagem de início da partida
socket.on("start-match", () => {
    socket.emit("get-match-info", matchId);
});

//Recebe as infos da partida
socket.on("recieve-match-info", async matchInfo => {
    console.log("match info -> ", matchInfo.matchTiles, matchInfo.matchNodeArray);
    await parseMatchInfos(matchInfo);
    posicionaTiles(matchInfo.matchTiles);
    posicionaNodes(matchInfo.matchTiles);

    actualMatchInfo = matchInfo;
})

window.addEventListener("resize", () => {
    let oldNodes = document.querySelectorAll(".tile-node");
    oldNodes.forEach(node => {
        node.remove();
    })
    posicionaNodes(actualMatchInfo.matchTiles);
})

checkboxNodeVisEl.addEventListener("click", () => {
    let tileNodes = document.querySelectorAll(".tile-node");

    if (checkboxNodeVisEl.checked) {
        tileNodes.forEach(node => {
            node.style.opacity = "1";
        })
    }
    else {
        tileNodes.forEach(node => {
            node.style.opacity = "0";
        })
    }
})