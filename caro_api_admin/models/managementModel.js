const db = require('../utils/db');

module.exports = {

    getAllUsers: _ => db.load(`SELECT ID, Username, Name, Email, Status FROM Users WHERE IsAdmin = 0 ORDER BY Name ASC`),

    getUserByID: id => db.load(`SELECT * FROM Users WHERE ID = '${id}' AND IsAdmin = 0`),

    getUserNameByID: id => db.load(`SELECT Name FROM Users WHERE ID = '${id}' AND IsAdmin = 0`),

    getUserAvatarByID: id => db.load(`SELECT Avatar FROM Users WHERE ID = '${id}' AND IsAdmin = 0`),

    getAllGamesByPlayerID: id => db.load(`SELECT ID, Name, Player1ID, Result FROM Games WHERE (Player1ID = '${id}' OR Player2ID = '${id}') AND Status = 0`),

    getGameByID: id => db.load(`SELECT * FROM Games WHERE ID = '${id}'`),


    // getUsersByIDsLite: IDs => db.load(`SELECT ID, Name FROM Users WHERE ID IN (${IDs})`),// IDs: ['userID','userID',...]

    // getUserNameByID: id => db.load(`SELECT Name FROM Users WHERE ID = '${id}' AND IsAdmin = 1`),

    // getUserStatusByID: id => db.load(`SELECT Status FROM Users WHERE ID = '${id}' AND IsAdmin = 1`),


    // updateUserStatus: (id, status) => db.patch('Users', { Status: status }, { ID: id }),

    // updateUserInfo: (id, { Name, Email, DateOfBirth }) => db.patch('Users', { Name, Email, DateOfBirth }, { ID: id }),

    // updateUserPassword: (id, { Password }) => db.patch('Users', { Password }, { ID: id }),

    // updateUserAvatar: (id, { Avatar }) => db.patch('Users', { Avatar }, { ID: id }),

}