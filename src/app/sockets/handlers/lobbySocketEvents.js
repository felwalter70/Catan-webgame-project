const lobbyController = require("../../controllers/lobbyController");

module.exports = async function (io, socket) {

    socket.on("create-match", async () => {
        await lobbyController.criaAndJoinMatch(io, socket);
    });

    socket.on("join-match", async matchId => {
        await lobbyController.joinMatch(io, socket, matchId);
    });

    socket.on("lobby-ready", async matchId => {
        await lobbyController.matchReady(io, socket, matchId);
    });

    socket.on("disconnect", () => {
        console.log("Saiu -> ", socket.id);
        socket.leave();
    });
}