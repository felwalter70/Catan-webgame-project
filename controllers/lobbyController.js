const userService = require("../services/userService");
const matchService = require("../services/matchService");
const crypto = require("crypto");

async function renderLobby(req, res) {
    if (req.session.user) {
        const lobbyMatches = await matchService.getLobbyMatches();

        res.render("catanLobby", {matches: lobbyMatches});
    }
    else {
        res.redirect("/user/catanLogin");
    }
}

async function criaAndJoinMatch(io, socket) {
    try {
        //Gera o id da partida
        const matchId = (crypto.randomBytes(16)).toString("hex");

        const sessionUser = socket.request.session.user;
        await matchService.createInsertMatch(sessionUser, matchId);

        const matchLobbyInfos = await matchService.getLobbyMatchInfo(matchId);
        socket.join(matchId);
        
        const changePageState = true;
        socket.emit("infos-lobby-match", matchLobbyInfos, changePageState);
        socket.to(matchId).emit("infos-lobby-match", matchLobbyInfos);
        
    } catch (erro) {
        console.error(erro);
    }
}

async function joinMatch(io, socket, matchId) {
    try {
        const sessionUser = socket.request.session.user;
        await matchService.insertPlayerInMatch(sessionUser, matchId);
        
        const matchLobbyInfos = await matchService.getLobbyMatchInfo(matchId);
        socket.join(matchId);

        const changePageState = true;
        socket.emit("infos-lobby-match", matchLobbyInfos, changePageState);
        socket.to(matchId).emit("infos-lobby-match", matchLobbyInfos);

    } catch (erro) {
        console.error(erro);
    }
    
}

module.exports = {
    renderLobby,
    criaAndJoinMatch,
    joinMatch
}