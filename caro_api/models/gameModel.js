const db = require('../utils/db');

module.exports = {
    getAllGames: _ => db.load('SELECT * FROM Games WHERE Status = 1 OR Status = 2'),

    getAllGamesByUserID: id => db.load(`SELECT ID, Name, Player1ID, Result FROM Games WHERE (Player1ID = '${id}' OR Player2ID = '${id}') AND Status = 0`),

    checkGameExistByID: id => db.load(`SELECT ID,Password FROM Games WHERE ID = '${id}' AND Status = 1`),

    getGameByID: id => db.load(`SELECT * FROM Games WHERE ID = '${id}'`),

    getPlayers: gameID => db.load(`SELECT U.* FROM Games G JOIN Users U ON 
        (G.Player1ID = U.ID OR G.Player2ID = U.ID) AND G.ID = '${gameID}'`),

    getPlayersLite: gameID => db.load(`SELECT U.ID FROM Games G JOIN Users U ON 
        (G.Player1ID = U.ID OR G.Player2ID = U.ID) AND G.ID = '${gameID}'`),

    addGame: entity => db.add('Games', entity),

    updateGame: (id, entity) => db.patch('Games', entity, { ID: id }),
}