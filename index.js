const express = require('express');
const { engine } = require('express-handlebars');
const fileUpload = require('express-fileupload');
const fs = require('node:fs');
const moment = require('moment');
const path = require('path');
const hbs = require('hbs');


// App
const app = express();

//Socket.io
const io = require("socket.io")(3000, {
    cors: {
        origin: ["http://localhost:8080"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

//Requisita infos de prod
require('dotenv').config();

//Porta
const PORT = process.env.PORT || 8080;


//Sessão usuário e config
const session = require('express-session');
const { json } = require('node:stream/consumers');
const { equal, match } = require('node:assert');
const { Socket } = require('socket.io');
const { get } = require('node:http');

const sessao = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
})

app.use(sessao);
io.use((socket, next) => {
    sessao(socket.request, {}, next);
});

//config handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.engine('handlebars', engine({
    defaultLayout: 'main', 
    partialsDir: path.join(__dirname, '/views/partials'),
    helpers: {
        formatDate: (date) => {
            return moment(date).format('DD/MM/YYYY');
        },
        formatDateHour: (date) => {
            return moment(date).format('DD/MM/YYYY, HH:mm:ss');
        },
        formatHourMinute: (date) => {
            return moment(date).format('HH:mm');
        },
        equal: (a, b) => { 
            return (a === b); 
        }
    }
}));

app.set('view engine', 'handlebars');

//Receber infos inputs
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//Upload de arquivos
app.use(fileUpload());

//pasta public
app.use(express.static(path.join(__dirname, 'public')));

//Use nas rotas
const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);

const lobbyRoutes = require("./routes/lobbyRoutes");
app.use("/lobby", lobbyRoutes);

//webSockets
const lobbySocketEvents = require("./sockets/lobbySocketEvents");

//Start da partida, geração dos Tiles

let tileTypes = [];
let vetorPlayers = [];
let nodeArray = [];
let matchTiles = [];
let edgeArray = [];

io.on("connection", async socket => {
    console.log("socket id -> ", socket.id);

    const userSession = socket.request.session;
    console.log("User session => ", userSession);

    vetorPlayers.push(socket.id);
    console.log(vetorPlayers);

    lobbySocketEvents(io, socket);

/*    socket.on("disconnect", () => {
        console.log("Saiu -> ", socket.id);

        vetorPlayers.splice(vetorPlayers.indexOf(socket.id), 1);
        socket.leave();

        console.log(vetorPlayers);
    });

    socket.on("join-match", async matchId => {
        const conexao = await pool.getConnection();

        try {
            await conexao.beginTransaction();

            const querySelectMatch = "SELECT * FROM matches WHERE matchId = ? FOR UPDATE";
            const [ rows ] = (await conexao.execute(querySelectMatch, [matchId]));
            const match = rows[0];

            console.log("Match => ", match);

            if (!match) {
                console.log("Sala inexistente");
                conexao.rollback();
                return;
            }
            else if (match.nPlayers >= match.maxPlayers) {
                console.log("Sala cheia");
                conexao.rollback();
                return;
            }
            
            const queryInsertPlayer = "INSERT INTO match_players (userId, matchId, cor) Values (?, ?, ?);";
            const queryUpdateMatch = "UPDATE matches SET nPlayers = nPlayers + 1 WHERE matchId = ?";
            const insertPlayerValues = [socket.id, matchId, '#000000'];

            await conexao.execute(queryInsertPlayer, insertPlayerValues);
            await conexao.execute(queryUpdateMatch, [matchId]);

            await conexao.commit()

            const lobbyMatchInfo = await getLobbyMatchInfo(matchId);

            socket.join(matchId);
            io.to(matchId).emit("infos-lobby-match", lobbyMatchInfo);


        } catch (erro) {
            console.error(erro);

            await conexao.rollback();

            res.redirect("/catanLobby");
        } finally {
            conexao.release();
        }
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

    socket.on("gera-match", async () => {
        for (let i = 0; i < 6; i++) {
            tileTypes.push("wood", "sheep", "wheat");

            if (i < 5)
                tileTypes.push("brick", "stone");

            if (i < 2)
                tileTypes.push("desert");
        }

        //O mesmo para os tiles
        let querySqlTableMatchTiles = `CREATE TABLE IF NOT EXISTS match_tiles (matchId VARCHAR(32), id INT, number INT, type VARCHAR(20), nodes VARCHAR(255), bandit TINYINT);`
        let querySqlMatchTilesInsert = `INSERT INTO match_tiles (matchId, id, number, type, nodes, bandit) Values `;

        //O mesmo para os nodes
        let querySqlTableMatchNodes = `CREATE TABLE IF NOT EXISTS match_nodes (matchId VARCHAR(32), id VARCHAR(10), occupation VARCHAR(32), adj_list VARCHAR(255));`
        let querySqlMatchNodesInsert = `INSERT INTO match_nodes (matchId, id, occupation, adj_list) Values `;

        //Seta o array de nodes
        initArrayNodes(7, nodeArray);

        //Declara e printa o nodeMap
        let nodeMap = new Map(nodeArray.map(obj => [obj.id, obj]));

        //console.log("Node map => ", Object.fromEntries(nodeMap));
        nodeMap.forEach((valor, key) => {
            console.log(key + " => {\n    [");
            valor.adjList.forEach(adj => {
                console.log("       ", adj, ",");
            })
            console.log("    ]\n}");
        });

        //Gera os tiles, escolhe o tile para colocar o bandit e coloca
        matchTiles = geraVetorTiles(7);
        matchTiles.filter(tile => tile.type == "desert")[(Math.floor(Math.random() * 2))].bandit = 1;

        
        //Ajeita os nodes de cada tile
        setTileNodes(matchTiles);
        console.log("Match Tiles => ", matchTiles);
        
        console.log("Teste -> ", matchTiles.filter(tile => tile.type == "desert"));

        const playerOrdem = geraOrdem();

        const conexao = await pool.getConnection();

        try {
            await pool.execute(querySqlTableMatchTiles);
            await pool.execute(querySqlTableMatchNodes);

            try {
                //Declara os vetores de valores a serem inseridos nas querys
                let valoresQueryTilesInsert = [];
                let valoresQueryMatchNodes = [];

                //Preenche os valores da partida
                
                //Preenche os valores dos tiles 
                let insertPlaceholders = [];

                matchTiles.forEach(tile => {
                    valoresQueryTilesInsert.push(matchId, tile.id, tile.number, tile.type, JSON.stringify(tile.nodeList), tile.bandit);

                    insertPlaceholders.push("(?, ?, ?, ?, ?, ?)");
                });

                querySqlMatchTilesInsert += insertPlaceholders.join(", ");

                //Preenche os valores dos Nodes
                insertPlaceholders = [];

                nodeArray.forEach(node => {
                    valoresQueryMatchNodes.push(matchId, node.id, "", JSON.stringify(node.adjList));

                    insertPlaceholders.push("(?, ?, ?, ?)");
                });

                querySqlMatchNodesInsert += insertPlaceholders.join(", ");

                await pool.execute(querySqlMatchTilesInsert, valoresQueryTilesInsert);
                await pool.execute(querySqlMatchNodesInsert, valoresQueryMatchNodes);

                io.to("sala").emit("start-match");
            } catch (erro) {
                console.error(erro);
            }
        } catch (erro) {
            console.error(erro);
        }
    });

    socket.on("get-match-info", async (matchId) => {
        let matchInfo = await getMatchInfo(matchId);

        socket.emit("recieve-match-info", matchInfo);
    });

    //socket.on("adiciona-estrutura-node") */
});

app.get("/", (req, res) => {
    res.redirect(`/user/catanLogin`);
});

app.listen(PORT)