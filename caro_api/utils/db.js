const mysql = require("mysql");
const util = require("util");
const config = require('../config/default.json');

const pool = mysql.createPool(config.mysql);

const mysql_query = util.promisify(pool.query).bind(pool);

module.exports = {
    load: sql_string => mysql_query(sql_string),

    loadSafe: (sql_string, entity) => mysql_query(sql_string, entity),

    add: (tableName, entity) => mysql_query(`insert into ${tableName} set ?`, entity),

    delete: (sql_string, entity) => mysql_query(sql_string, entity),

    patch: (tableName, entity, condition) => mysql_query(`update ${tableName} set ? where ?`, [entity, condition]),
};