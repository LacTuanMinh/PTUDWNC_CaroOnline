const db = require('../utils/db');

module.exports = {
    getAllUsername: _ => db.load('SELECT Username FROM Users WHERE IsAdmin = 0'),

    getAllOnlineUsers: _ => db.load(`SELECT ID, Name FROM Users WHERE IsAdmin = 0 AND Status = 1`),

    getPasswordByID: id => db.load(`SELECT Password FROM Users WHERE ID = '${id}' AND IsAdmin = 0`),

    getUsersByIDsLite: IDs => db.load(`SELECT ID, Name FROM Users WHERE ID IN (${IDs})`),// IDs: ['userID','userID',...]

    getUserByID: id => db.load(`SELECT * FROM Users WHERE ID = '${id}' AND IsAdmin = 0`),

    getUserNameByID: id => db.load(`SELECT Name FROM Users WHERE ID = '${id}' AND IsAdmin = 0`),

    getUserStatusByID: id => db.load(`SELECT Status FROM Users WHERE ID = '${id}' AND IsAdmin = 0`),

    getUserByUserName: userName => db.load(`SELECT ID, Name, Password, IsAdmin, Status FROM Users WHERE Username = '${userName}' AND IsAdmin = 0`),

    getUserAvatarByID: id => db.load(`SELECT Avatar FROM Users WHERE ID = '${id}' AND IsAdmin = 0`),

    getRanking: limit => db.load(`SELECT ID, Name, Elo, ROUND((WinCount / PlayCount) * 100, 2) AS WinRate FROM Users WHERE PlayCount > 0 AND IsAdmin = 0 ORDER BY Elo DESC LIMIT ${limit}`),

    getMedal: _ => db.load(`SELECT * FROM Medals ORDER BY ID ASC`),

    addUser: entity => db.add('Users', entity),

    updateUserStatus: (id, status) => db.patch('Users', { Status: status }, { ID: id }),

    updateUserScore: (id, { Elo, WinCount, PlayCount }) => db.patch('Users', { Elo, WinCount, PlayCount }, { ID: id }),

    updateUserInfo: (id, { Name, Email, DateOfBirth }) => db.patch('Users', { Name, Email, DateOfBirth }, { ID: id }),

    updateUserPassword: (id, { Password }) => db.patch('Users', { Password }, { ID: id }),

    updateUserAvatar: (id, { Avatar }) => db.patch('Users', { Avatar }, { ID: id }),

    updateUserActivatedDate: (id, date) => db.patch('Users', { ActivatedDate: date }, { ID: id }),
}