import { io } from "./socket.io.esm.min.js";

const socket = io("http://localhost:3000", {
    withCredentials: true
});

let botaoCriaMatchEl = document.querySelector(".btn-criar-partida");
let botaoSairMatchEl = document.querySelector(".btn-sair-partida");
let botaoReadyEl = document.querySelector(".btn-ready");
let botaoEntrarMatchNode = document.querySelectorAll(".btn-entrar-partida");

let lobbyArea1El = document.querySelector(".lobby-area-1");
let lobbyArea2El = document.querySelector(".lobby-area-2");

function alternaAreasLobby() {
    lobbyArea1El.classList.toggle("display");
    lobbyArea2El.classList.toggle("display");
}


botaoCriaMatchEl.addEventListener("click", async () => {
    socket.emit("create-match");
});

botaoSairMatchEl.addEventListener("click", () => {
    alternaAreasLobby();
});

botaoReadyEl.addEventListener("click", (e) => {
    const btnAtualEl = e.currentTarget;
    const matchId = btnAtualEl.dataset.matchId;

    if (matchId.length)
        socket.emit("lobby-ready", matchId);
});

botaoEntrarMatchNode.forEach(btnAtualEl => {
    btnAtualEl.addEventListener("click", async (e) => {
        let btnAtualEl = e.currentTarget;
        let matchId = btnAtualEl.dataset.matchId;

        botaoReadyEl.dataset.matchId = matchId;
    
        console.log("MatchId => ", matchId);
    
        await socket.emit("join-match", matchId);
    });
});


function geraLobbyPlayersNode(vPlayers) {
    let playerNode = [];

    vPlayers.forEach(player => {
        let spanEl = document.createElement("span");

        let userImgEl = document.createElement("img");
        userImgEl.src = "/imgs/users/" + player.profileImg;
        userImgEl.classList.add("player-lobby-img");

        let playerNameEl = document.createElement("p");
        playerNameEl.innerHTML = player.username;

        let readyStateImgEl = document.createElement("img");
        readyStateImgEl.src = (Number(player.isReady) ? "/imgs/icons/check.svg" : "/imgs/icons/close.svg");
        readyStateImgEl.classList.add((Number(player.isReady) ? 'ready-state-img' : 'not-ready-state-img'))

        spanEl.appendChild(userImgEl);
        spanEl.appendChild(playerNameEl);
        spanEl.appendChild(readyStateImgEl);

        playerNode.push(spanEl);
    });

    return playerNode;
}

socket.on("infos-lobby-match", (lobbyMatchInfos, change) => {
    if (change)
        alternaAreasLobby();

    const containerLobbyPlayersEl = document.querySelector(".container-lobby-players");
    const nPlayersEl = document.querySelector(".n-lobby-players");

    console.log("lobbyMatchInfos => ", lobbyMatchInfos);

    containerLobbyPlayersEl.innerHTML = '';
    nPlayersEl.innerHTML = lobbyMatchInfos.match.nPlayers + " / " + lobbyMatchInfos.match.maxPlayers;

    const vPlayersNode = geraLobbyPlayersNode(lobbyMatchInfos.matchPlayers);

    vPlayersNode.forEach(playerElement => {
        containerLobbyPlayersEl.appendChild(playerElement);
    })
});