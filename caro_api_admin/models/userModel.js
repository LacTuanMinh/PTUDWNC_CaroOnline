const db = require('../utils/db');

module.exports = {

    getUserByID: id => db.load(`SELECT ID, Username FROM Users WHERE ID = '${id}' AND IsAdmin = 1`),

    getUserByUserName: userName => db.load(`SELECT ID, Name, Password, IsAdmin FROM Users WHERE Username = '${userName}' AND IsAdmin = 1`),

}