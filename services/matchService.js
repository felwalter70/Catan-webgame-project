const pool = require("../config/db");
const crypto = require("crypto");

//Classes

class Tile {
    constructor (type, num, id) {
        this.type = type;
        this.id = id;
        this.number = num;
        this.bandit = 0;
        this.nodeList = [];
    }
}

class Node {
    constructor (id) {
        this.id = id;
        this.occupation = "";
        this.adjList = [];
    }
}

class Edge {
    constructor(origin, destiny) {
        this.origin = origin;
        this.destiny = destiny;
        this.occupation = undefined;
    }
}

class Construcao {
    constructor(type, positionId, owner) {
        this.type = type;
        this.positionId = positionId;
        this.owner = owner;
    }
}

class Player {
    constructor (socketId) {
        this.socketId = socketId;
        this.ordem = undefined;
    }
}

//Inicializa o vetor de nodes
function initArrayNodes(rows, nodeArray) {
    for (let i = 0, redutor = 0; i < 8; i++) {
        if (i < 4) {
            let rowSize = rows + 2 * i;

            //console.log("Row Size -> ", rowSize)
    
            for (j = 0; j < rowSize; j++) {
                let nodeId = String.fromCharCode(65 + i) + String((j + 1));
                let newNode = new Node(nodeId);
                let vEdges = [];

                if (j % 2 == 0) {
                    let downNeighbourId = String.fromCharCode(65 + i + 1) + String((j + 2 + (i == 3 ? -1 : 0)));

                    vEdges.push(new Edge(nodeId, downNeighbourId));
                }
                else if (i > 0) {
                    let upperNeighbourId = String.fromCharCode(65 + i - 1) + String((j));

                    vEdges.push(new Edge(nodeId, upperNeighbourId));
                }

                if (j != rowSize - 1) {
                    let rightNeighbourId = String.fromCharCode(65 + i) + String((j + 2));

                    vEdges.push(new Edge(nodeId, rightNeighbourId));
                }

                if (j != 0) {
                    let leftNeighbourId = String.fromCharCode(65 + i) + String((j));

                    vEdges.push(new Edge(nodeId, leftNeighbourId));
                }

                edgeArray.push(...vEdges);

                vEdges.forEach(edge => {
                    newNode.adjList.push(edge.destiny);
                });

                nodeArray.push(newNode);
            }
        }
        else if (i == 4) {
            let rowSize = 13;

            for (let j = 0; j < rowSize; j++) {
                let nodeId = String.fromCharCode(65 + i) + String((j + 1));
                let newNode = new Node(nodeId);
                let vEdges = [];

                if (j % 2 == 0) {
                    let upperNeighbourId = String.fromCharCode(65 + i - 1) + String((j + 2 + (i == 4 ? -1 : 0)));

                    vEdges.push(new Edge(nodeId, upperNeighbourId));
                }
                else if (i < rows - 1) {
                    let downNeighbourId = String.fromCharCode(65 + i + 1) + String((j));

                    vEdges.push(new Edge(nodeId, downNeighbourId));
                }

                if (j != rowSize - 1) {
                    let rightNeighbourId = String.fromCharCode(65 + i) + String((j + 2));

                    vEdges.push(new Edge(nodeId, rightNeighbourId));
                }

                if (j != 0) {
                    let leftNeighbourId = String.fromCharCode(65 + i) + String((j));
                    
                    vEdges.push(new Edge(nodeId, leftNeighbourId));
                }

                edgeArray.push(...vEdges);

                vEdges.forEach(edge => {
                    newNode.adjList.push(edge.destiny);
                });

                nodeArray.push(newNode);
            }
        }
        else {
            let rowSize = 16 - (i + redutor);
            redutor++;

            for (let j = 0; j < rowSize; j++) {
                let nodeId = String.fromCharCode(65 + i) + String((j + 1));
                let newNode = new Node(nodeId);
                let vEdges = [];

                if (j % 2 == 0) {
                    let upperNeighbourId = String.fromCharCode(65 + i - 1) + String((j + 2 + (i == 4 ? -1 : 0)));

                    vEdges.push(new Edge(nodeId, upperNeighbourId));
                }
                else if (i < rows) {
                    let downNeighbourId = String.fromCharCode(65 + i + 1) + String((j));

                    vEdges.push(new Edge(nodeId, downNeighbourId));
                }

                if (j != rowSize - 1) {
                    let rightNeighbourId = String.fromCharCode(65 + i) + String((j + 2));

                    vEdges.push(new Edge(nodeId, rightNeighbourId));
                }

                if (j != 0) {
                    let leftNeighbourId = String.fromCharCode(65 + i) + String((j));
                    
                    vEdges.push(new Edge(nodeId, leftNeighbourId));
                }

                edgeArray.push(...vEdges);

                vEdges.forEach(edge => {
                    newNode.adjList.push(edge.destiny);
                });

                nodeArray.push(newNode);
            }
        }
    }

    return;
}

//Gera o vetor de Tiles
function geraVetorTiles(rows) {
    let vetorTiles = [];

    let tileId = 1;

    for (let i = 0, limite = 3, iteradorVX = 3, iteradorVY = 0; i < rows; i++, iteradorVY += 2) {
        //console.log("Xi -> ", iteradorVX, "Yi -> ", iteradorVY);
        for (let j = 0; j < limite; j++) {
            let tileSortido = (Math.floor(Math.random() * (tileTypes.length)));

            let newTile = new Tile(
                tileTypes[tileSortido], 
                (Math.floor(Math.random() * (12 - 2 + 1)) + 2),
                tileId
            );

            tileId++;

            vetorTiles.push(newTile);

            tileTypes.splice(tileSortido, 1);
            iteradorVX += 2;
        }

        //console.log("Xt -> ", iteradorVX, "Yt -> ", iteradorVY);

        if (i < 3) {
        limite++;
        iteradorVX -= iteradorVY + 7;
        }
        else {
            limite--;
            //console.log("Lim -> ", limite);
            iteradorVX -= 1 + 2 * limite;
        }

        if (i == 3) {
            console.log("3");
        }

        //console.log("Xf -> ", iteradorVX, "Yf -> ", iteradorVY);
    }

    //console.log("-> ", tileTypes);

    return vetorTiles;
}

//Preenche os tiles com seus respectivos nodes
function setTileNodes(vTiles) {
    let limite = 3;
    let indiceTileAtual = 0;

    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < limite; j++) {
            for (let k = 0; k < 6; k++) {
                let nodeId = "";

                if (i < 3) {
                    if (k < 3) {
                        nodeId = String.fromCharCode(65 + i) + String(j * 2 + (k + 1)); 
                    }
                    else {
                        nodeId = String.fromCharCode(66 + i) + String(j * 2 + (k % 3 + 1) + 1); 
                    }
                }
                else if (i == 3) {
                    if (k < 3) {
                        nodeId = String.fromCharCode(65 + i) + String(j * 2 + (k + 1)); 
                    }
                    else {
                        nodeId = String.fromCharCode(66 + i) + String(j * 2 + (k % 3 + 1)); 
                    }
                }
                else {
                    if (k < 3) {
                        nodeId = String.fromCharCode(65 + i) + String(j * 2 + (k + 1) + 1); 
                    }
                    else {
                        nodeId = String.fromCharCode(66 + i) + String(j * 2 + (k % 3 + 1)); 
                    }
                }

                vTiles[indiceTileAtual].nodeList.push(nodeId);
            }

            indiceTileAtual++;
        }

        if (i < 3) {
            limite++;
        }
        else {
            limite--;
        }
    }
}

//Gera a ordem de jogada dos players
function geraOrdem(vetorPlayers) {
    while (1) {
        let numOrdem = Math.floor(Math.random() * vetorPlayers.length);

        if (!(vetorPlayers.filter(p => p.ordem == numOrdem)[0])) {
            return numOrdem;
        }
    }
}

//Parte DB
async function getLobbyMatches() {
    const queryMatches = "SELECT * FROM matches LIMIT 20";

    let [ matches ] = await pool.execute(queryMatches);

    return matches;
}

async function getMatch(matchId) {
    const querySelectMatch = `SELECT * FROM matches WHERE matchId = ?`;

    const [ rows ] = (await pool.execute(querySelectMatch, [matchId]));
    return rows[0];
}

//Pega as informações da partida no banco de dados
async function getMatchInfo(matchId) {

    const match = await getMatch(matchId);

    const querySelectMatchTiles = `SELECT * FROM match_tiles WHERE matchId = ?`;
    const querySelectMatchPlayers = `SELECT * FROM match_players WHERE matchId = ?`;
    const querySelectMatchNodes = `SELECT * FROM match_nodes WHERE matchId = ?`;

    const [ matchTiles ] = await pool.execute(querySelectMatchTiles);
    const [ matchNodes ] = await pool.execute(querySelectMatchNodes);
    const [ matchPlayers ] = await pool.execute(querySelectMatchPlayers);

    return {matchId: matchId, match: match, matchTiles: matchTiles, matchNodeArray: matchNodes, matchPlayers: matchPlayers};
}

//Pega as informações do lobby atual
async function getLobbyMatchInfo(matchId) {
    const match = await getMatch(matchId);

    const querySelectMatchPlayers = `SELECT mp.*, u.username, u.profileImg FROM match_players mp INNER JOIN users u on mp.uuid = u.uuid`;
    const [ matchPlayers ] = await pool.execute(querySelectMatchPlayers, [matchId]);

    return {matchId: matchId, match: match, matchPlayers: matchPlayers};
}

//Cria e da insert da match + insert do player
async function createInsertMatch(user, matchId) {
    //Comando para criar tabela partidas caso n exista e cria o comando de insert da atual
    const querySqlTableMatches = `CREATE TABLE IF NOT EXISTS matches (matchId VARCHAR(32) PRIMARY KEY, state VARCHAR(16), nPlayers INT DEFAULT 1, maxPlayers INT DEFAULT 6);`;
    const querySqlMatchesInsert = `INSERT INTO matches (matchId, state) Values (?, ?)`;

    //O mesmo para os players
    const querySqlTableMatchPlayers = `CREATE TABLE IF NOT EXISTS match_players (uuid VARCHAR(36) PRIMARY KEY, matchId VARCHAR(32), isReady TINYINT DEFAULT 0, ordem INT DEFAULT 0, cor VARCHAR(7), wood INT DEFAULT 0, wheat INT DEFAULT 0, brick INT DEFAULT 0, stone INT DEFAULT 0, sheep INT DEFAULT 0, points INT DEFAULT 0);`
    const querySqlMatchPlayersInsert = `INSERT INTO match_players (uuid, matchId, cor) Values (?, ?, ?)`;

    const conexao = await pool.getConnection();

    try {
        await conexao.beginTransaction();

        await conexao.execute(querySqlTableMatches);
        await conexao.execute(querySqlTableMatchPlayers);

        //Declara os vetores de valores a serem inseridos nas querys
        let valoresQueryMatch = [];
        
        //Preenche os valores da partida
        valoresQueryMatch.push(matchId, "unready");
        
        //Preenche os valores dos players
        let valoresQueryPlayersInsert = [user.uuid, matchId, "#000000"];

        await conexao.execute(querySqlMatchesInsert, valoresQueryMatch);
        await conexao.execute(querySqlMatchPlayersInsert, valoresQueryPlayersInsert);

        await conexao.commit();
    } catch (erro) {
        await conexao.rollback();

        throw erro;
    } finally {
        conexao.release();
    }
}

async function insertPlayerInMatch(user, matchId) {
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
        
        const queryInsertPlayer = "INSERT INTO match_players (uuid, matchId, cor) Values (?, ?, ?);";
        const queryUpdateMatch = "UPDATE matches SET nPlayers = nPlayers + 1 WHERE matchId = ?";
        const insertPlayerValues = [user.uuid, matchId, '#000000'];

        await conexao.execute(queryInsertPlayer, insertPlayerValues);
        await conexao.execute(queryUpdateMatch, [matchId]);

        await conexao.commit()

    } catch (erro) {
        console.error(erro);

        await conexao.rollback();

        throw erro;
    } finally {
        conexao.release();
    }
}

module.exports = {
    getMatchInfo,
    getLobbyMatchInfo,
    createInsertMatch,
    getLobbyMatches,
    insertPlayerInMatch
}