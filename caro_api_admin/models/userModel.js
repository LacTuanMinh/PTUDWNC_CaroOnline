const db = require('../utils/db');

module.exports = {
    getAllUsername: _ => db.load('SELECT Username FROM Users WHERE IsAdmin = 0'),

    getAllUsers: _ => db.load(`SELECT ID, Username, Name, Email, Status FROM Users WHERE IsAdmin = 0 ORDER BY Name ASC`),

    getPasswordByID: id => db.load(`SELECT Password FROM Users WHERE ID = '${id}' AND IsAdmin = 0`),

    getUserByID: id => db.load(`SELECT * FROM Users WHERE ID = '${id}' AND IsAdmin = 1`),

    getUserByUserName: userName => db.load(`SELECT ID, Name, Password, IsAdmin FROM Users WHERE Username = '${userName}' AND IsAdmin = 1`),

    // getUsersByIDsLite: IDs => db.load(`SELECT ID, Name FROM Users WHERE ID IN (${IDs})`),// IDs: ['userID','userID',...]

    // getUserNameByID: id => db.load(`SELECT Name FROM Users WHERE ID = '${id}' AND IsAdmin = 1`),

    // getUserStatusByID: id => db.load(`SELECT Status FROM Users WHERE ID = '${id}' AND IsAdmin = 1`),

    getUserAvatarByID: id => db.load(`SELECT Avatar FROM Users WHERE ID = '${id}' AND IsAdmin = 1`),

    updateUserStatus: (id, status) => db.patch('Users', { Status: status }, { ID: id }),

    updateUserInfo: (id, { Name, Email, DateOfBirth }) => db.patch('Users', { Name, Email, DateOfBirth }, { ID: id }),

    updateUserPassword: (id, { Password }) => db.patch('Users', { Password }, { ID: id }),

    updateUserAvatar: (id, { Avatar }) => db.patch('Users', { Avatar }, { ID: id }),

}