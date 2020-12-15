const db = require('../utils/db');

module.exports = {
    getAllUsername: _ => db.load('SELECT Username FROM Users'),

    getUserByID: id => db.load(`SELECT * FROM Users WHERE ID = '${id}' AND IsAdmin = 0`),

    getUserByUserName: userName => db.load(`SELECT ID, Name, Password, IsAdmin FROM Users WHERE Username = '${userName}' AND IsAdmin = 0`),

    addUser: entity => db.add('Users', entity),

    updateUserStatus: (id, status) => db.patch('Users', { Status: status }, { ID: id }),

    updateUserInfo: (id, { Elo, WinCount, PlayCount }) => db.patch('Users', { Elo, WinCount, PlayCount }, { ID: id }),

    getAllOnlineUsers: _ => db.load(`SELECT ID, Name FROM Users WHERE IsAdmin = 0 AND Status = 1`)
}