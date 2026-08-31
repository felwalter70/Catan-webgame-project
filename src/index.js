const express = require('express');
const { engine } = require('express-handlebars');
const fileUpload = require('express-fileupload');
const path = require('path');

// App
const app = express();

// Socket.io
const io = require('socket.io')(3000, {
    cors: {
        origin: ['http://localhost:8080'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Porta
const PORT = process.env.PORT || 8080;

// Sessão usuário e config
const session = require('express-session');
const { json } = require('node:stream/consumers');
const { equal, match } = require('node:assert');
const { Socket } = require('socket.io');
const { get } = require('node:http');

io.use((socket, next) => {
    sessao(socket.request, {}, next);
});

// configs handlebars
app.engine('handlebars', engine(
));

// Receber infos inputs
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Upload de arquivos
app.use(fileUpload());

// Link com a pasta public
app.use(express.static(path.join(__dirname, 'public')));

// webSockets
const lobbySocketEvents = require('./app/sockets/handlers/lobbySocketEvents');

/* Start da partida, geração dos Tiles
let tileTypes = [];
let vetorPlayers = [];
let nodeArray = [];
let matchTiles = [];
let edgeArray = [];
*/
/*
// Websocket init events
io.on('connection', async socket => {
    console.log('socket id -> ', socket.id);

    const userSession = socket.request.session;
    console.log('User session => ', userSession);

    vetorPlayers = await io.allSockets();
    console.log(vetorPlayers);

    lobbySocketEvents(io, socket);

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
});

// Redirect inicial
app.get('/', (req, res) => {
    res.redirect(`/user/catanLogin`);
});

app.listen(PORT);
*/
