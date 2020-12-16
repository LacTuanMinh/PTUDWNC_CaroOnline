const games = require('../routes/games');
const db = require('../utils/db');

module.exports = {
    getAllGames: _ => db.load('SELECT * FROM Games WHERE Status = 1'),

    checkGameExistByID: id => db.load(`SELECT ID,Password FROM Games WHERE ID = '${id}' AND Status = 1`),

    getGameByID: id => db.load(`SELECT * FROM Games WHERE ID = '${id}'`),

    getPlayers: gameID => db.load(`SELECT U.* FROM Games G JOIN Users U ON 
        (G.Player1ID = U.ID OR G.Player2ID = U.ID) AND G.ID = '${gameID}'`),

    addGame: entity => db.add('Games', entity),

    updateGameOwner: (id, player1ID, player2ID) => db.patch('Games', 
        { Player1ID: player1ID, Player2ID: player2ID }, { ID: id }),

    updateGameAfterPlaying: (id, Result, Status, Moves, ChatHistory) => db.patch('Games', 
        { Result, Status, Moves, ChatHistory }, { ID: id }),

    updateGame: (id, player2ID) => db.patch('Games', { Player2ID: player2ID }, { ID: id }),
}