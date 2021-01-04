const db = require('../utils/db');

module.exports = {

  addRequest: entity => db.add('ResetRequests', entity),

  getRequestByID: id => db.load(`SELECT * FROM ResetRequests WHERE ID = '${id}'`),

  updateRequest: (ID, entity) => db.patch('ResetRequests', entity, { ID }),
}