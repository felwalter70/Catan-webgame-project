const lobbyController = require("../controllers/lobbyController");

module.exports = async function (io, socket) {

    socket.on("create-match", async () => {
        lobbyController.criaAndJoinMatch(io, socket);
    });

    socket.on("join-match", async matchId => {
        lobbyController.joinMatch(io, socket, matchId);
    });

    socket.on("lobby-ready", async matchId => {
        const conexao = await pool.getConnection();

        try {
            await conexao.beginTransaction();

            const querySelectMatchPlayer = "SELECT m.matchId, mp.userId, mp.isReady FROM matches AS m INNER JOIN match_players AS mp ON m.matchId = mp.matchId WHERE m.matchId = ? AND mp.userId = ?";

            const [ rows ] = await conexao.execute(querySelectMatchPlayer, [matchId, socket.id]);
            const player = rows[0];

            console.log("Player => ", player);
            
            if (!player) {
                console.log("Player inexistente");
                await conexao.rollback();
                return;
            }

            let readyValue;

            if (!player.isReady) readyValue = 1;
            else readyValue = 0;

            const queryUpdatePlayer = "UPDATE match_players SET isReady = ? WHERE matchId = ? AND userId = ?";

            await conexao.execute(queryUpdatePlayer, [readyValue, matchId, socket.id]);

            await conexao.commit();

            const lobbyMatchInfo = await getLobbyMatchInfo(matchId);

            io.to(matchId).emit("infos-lobby-match", lobbyMatchInfo);

        } catch (erro) {
            console.error(erro);

            await conexao.rollback();

        } finally {
            conexao.release();
        }
    });
}