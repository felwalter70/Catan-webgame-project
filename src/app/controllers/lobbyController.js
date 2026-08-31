const userService = require("../services/userService");
const matchService = require("../services/matchService");
const crypto = require("crypto");

async function renderLobby(req, res) {
    if (req.session.user) {
        try {
            const lobbyMatches = await matchService.getLobbyMatches();
    
            res.render("catanLobby", {matches: lobbyMatches});
        } catch (erro) {
            console.error(erro);
        }
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
        
        const changePageNumber = 2;
        socket.emit("infos-lobby-match", matchLobbyInfos, changePageNumber);
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

        const changePageNumber = 2;
        socket.emit("infos-lobby-match", matchLobbyInfos, changePageNumber);
        socket.to(matchId).emit("infos-lobby-match", matchLobbyInfos, changePageNumber);

    } catch (erro) {
        console.error(erro);
    }
    
}

//Atualiza o estado de ready do usuário
async function matchReady(io, socket, matchId) {
    try {
        console.log("Coisa => ", matchId);
        const sessionUser = socket.request.session.user;

        //Adicionar confirmação dupla => player && player.matchId == matchId
        
        console.log("User id => ", sessionUser.uuid);
        await matchService.atualizaReadyPlayerState(sessionUser.uuid, matchId);

        const lobbyMatchInfo = await matchService.getLobbyMatchInfo(matchId);
        io.to(matchId).emit("infos-lobby-match", lobbyMatchInfo);

    } catch (erro) {
        console.error(erro);
    }
}

module.exports = {
    renderLobby,
    criaAndJoinMatch,
    joinMatch,
    matchReady
}