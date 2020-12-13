const games = require('../routes/games');
const db = require('../utils/db');

module.exports = {
    getAllGames: _ => db.load('SELECT * FROM Games'),

    getGameByID: id => db.load(`SELECT * FROM Games WHERE ID = '${id}'`),

    getPlayers: gameID => db.load(`SELECT U.* FROM Games G JOIN Users U ON 
        (G.Player1ID = U.ID OR G.Player2ID = U.ID) AND G.ID = '${gameID}'`),

    addGame: entity => db.add('Games', entity),

    updateGame: (id, player2ID) => db.patch('Games', { Player2ID: player2ID }, { ID: id }),
}