const db = require('../utils/db');

module.exports = {

	getAllUsers: _ => db.load(`SELECT ID, Username, Name, Email, Status FROM Users WHERE IsAdmin = 0 ORDER BY Name ASC`),

	getUserByID: id => db.load(`SELECT * FROM Users WHERE ID = '${id}' AND IsAdmin = 0`),

	getUserNameByID: id => db.load(`SELECT Name FROM Users WHERE ID = '${id}' AND IsAdmin = 0`),

	getUserAvatarByID: id => db.load(`SELECT Avatar FROM Users WHERE ID = '${id}' AND IsAdmin = 0`),

	getAllGames: _ => db.load(`SELECT g.ID, g.Name, u1.ID as ID1, u1.Name as Player1, u2.ID as ID2, u2.Name as Player2, g.Result, g.IsBlockedRule, g.TimeThinkingEachTurn, g.GameOverAt
                                FROM Games g join Users u1 on g.Player1ID = u1.ID 
                                                join Users u2 on g.Player2ID = u2.ID
                                WHERE g.Status = 0
                                ORDER BY g.GameOverAt DESC`),

	getAllGamesByPlayerID: id => db.load(`SELECT ID, Name, Player1ID, Result FROM Games WHERE (Player1ID = '${id}' OR Player2ID = '${id}') AND Status = 0`),

	getGameByID: id => db.load(`SELECT * FROM Games WHERE ID = '${id}'`),

	getMedal: _ => db.load(`SELECT * FROM Medals ORDER BY ID ASC`),

	updateUserStatus: (id, status) => db.patch('Users', { Status: status }, { ID: id }),

	// getUsersByIDsLite: IDs => db.load(`SELECT ID, Name FROM Users WHERE ID IN (${IDs})`),// IDs: ['userID','userID',...]

	// getUserNameByID: id => db.load(`SELECT Name FROM Users WHERE ID = '${id}' AND IsAdmin = 1`),

	// getUserStatusByID: id => db.load(`SELECT Status FROM Users WHERE ID = '${id}' AND IsAdmin = 1`),

	// updateUserInfo: (id, { Name, Email, DateOfBirth }) => db.patch('Users', { Name, Email, DateOfBirth }, { ID: id }),

	// updateUserPassword: (id, { Password }) => db.patch('Users', { Password }, { ID: id }),

	// updateUserAvatar: (id, { Avatar }) => db.patch('Users', { Avatar }, { ID: id }),

}