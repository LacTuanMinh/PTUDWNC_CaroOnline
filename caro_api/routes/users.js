// const express = require('express');
// const router = express.Router();


// /* GET users listing. */
// router.post('/authenticate', (req, res) => {
//   console.log("authenticated");
//   return res.status(200).end();
// });

// router.get('/games', function (req, res) {

// });
// module.exports = router;

module.exports = function (io) { // catch here

  const express = require('express');
  const router = express.Router();
  const userModel = require('../models/userModel');

  router.post('/authenticate', (req, res) => {
    console.log("authenticated");
    return res.status(200).send({ mesg: "ok" });
  });

  router.post('/signout', async (req, res) => {
    console.log("sign out");
    const { userID } = req.body;
    const affectedRow = await userModel.updateUserStatus(userID, 0);

    if (affectedRow === 0) {
      res.status(400).send({ mesg: 'Failed to sign out' });
    } else res.status(200).send({ mesg: 'Successful' });
  })

  // router.get('/games', function (req, res) {
  // 
  // });

  io.on("connection", async (socket) => {
    console.log("New client connected: ", socket.id);
    console.log("Total connects: ", io.engine.clientsCount);
    const userID = (socket.handshake.query['userID']);

    if (userID !== 'null') {
      await userModel.updateUserStatus(userID, 1);
      const list = await userModel.getAllOnlineUsers();
      console.log("connection", list);
      io.sockets.emit("server_RefreshList", list);
    }

    socket.on("client_LoggedIn", async (data) => {
      console.log("client logged ", data.userID);
      await userModel.updateUserStatus(data.userID, 1);// set status to Online (== 1)
      const list = await userModel.getAllOnlineUsers();
      console.log("client_LoggedIn", list);
      io.sockets.emit("server_RefreshList", list);
    });

    socket.on("disconnect", async () => {

      console.log("Client disconnected: ", userID);
      await userModel.updateUserStatus(userID, 0);
      // socket.removeAllListeners('disconnect');
      // io.removeAllListeners('connection');
    });
  });

  return router;
}
