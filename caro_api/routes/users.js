module.exports = function (io) { // catch here

  const express = require('express');
  const router = express.Router();
  const userModel = require('../models/userModel');
  const trackUserOnline = require('../utils/trackUserOnline');

  router.post('/authenticate', (req, res) => {
    console.log("authenticated");
    return res.status(200).send({ mesg: "ok" });
  });

  router.get('/get/:ID', async (req, res) => {
    const userID = req.params.ID;
    const user = await userModel.getUserByID(userID);
    console.log(user[0]);
    if (user) {
      res.status(200).send({ user: user[0] });
    }
    //else res.status(404).send()
  });

  router.post('/update', async (req, res) => {
    const { player, win, elo, opponentID } = req.body;

    const entity = {
      ...player,
      Elo: player.Elo + (win ? elo : -elo),
      WinCount: player.WinCount + (win ? 1 : 0),
      PlayCount: player.PlayCount + 1
    }
    console.log('entity', entity);

    await userModel.updateUserInfo(player.ID, { Elo: entity.Elo, WinCount: entity.WinCount, PlayCount: entity.PlayCount });
    const opponent = await userModel.getUserByID(opponentID);
    return res.status(200).send({ msg: "Players updated", player: entity, opponent });
  });

  router.post('/signout', async (req, res) => {

    const { userID } = req.body;
    const affectedRow = await userModel.updateUserStatus(userID, 0);

    if (affectedRow === 0) {
      res.status(400).send({ mesg: 'Failed to sign out' });
    } else res.status(200).send({ mesg: 'Successful' });

  })

  router.post('/profile/:userID', async (req, res) => {
    const userID = req.params.userID;

    const results = await userModel.getUserByID(userID);
    if (results.length === 1) {
      const result = results[0];
      console.log((results));
      delete result.Password;
      delete result.Status;
      delete result.IsAdmin;
      res.status(200).send({ userInfo: result });
    } else {
      res.status(400).end();
    }
  })

  router.post('/games/join', (req, res) => {

    const { ID, Password } = req.body;
    console.log(ID, Password);
    // continua here

    res.status(200).send({ mesg: 'ok' });
  });

  const userSocketIdMap = new Map(); //a map of online usernames and their clients

  io.on("connection", async (socket) => {
    console.log("New client connected: ", socket.id);
    console.log("Total connects: ", io.engine.clientsCount);

    const userID = (socket.handshake.query['userID']);

    if (userID !== 'null') {
      const addResult = trackUserOnline.addClientToMap(userSocketIdMap, userID, socket.id);

      if (addResult === 1) {
        await userModel.updateUserStatus(userID, 1);
      }

      const list = await userModel.getAllOnlineUsers();
      // console.log(list);
      io.sockets.emit("server_RefreshList", list);
    }

    socket.on("client_LoggedIn", async (data) => {
      // console.log("client logged in", data.userID);
      const addResult = trackUserOnline.addClientToMap(userSocketIdMap, data.userID, socket.id);

      if (addResult === 1) {
        // console.log("userID: " + data.userID);
        const res = await userModel.updateUserStatus(data.userID, 1);
        // console.log(res);
      }

      const list = await userModel.getAllOnlineUsers();
      io.sockets.emit("server_RefreshList", list);
    });

    socket.on("client_LoggedOut", async (data) => {
      // console.log("client logged out", data.userID);

      const rmvResult = trackUserOnline.removeClientFromMap(userSocketIdMap, data.userID, socket.id);

      if (rmvResult === 1) {
        await userModel.updateUserStatus(data.userID, 0);// set status to off line (== 0)
      }

      const list = await userModel.getAllOnlineUsers();
      io.sockets.emit("server_RefreshList", list);
    });

    socket.on("disconnect", async () => {

      console.log("Client disconnected: ", userID);
      const rmvResult = trackUserOnline.removeClientFromMap(userSocketIdMap, userID, socket.id);

      if (rmvResult === 1) {
        await userModel.updateUserStatus(userID, 0);// set status to off line (== 0)
      }

      const list = await userModel.getAllOnlineUsers();
      socket.broadcast.emit("server_RefreshList", list)
      // socket.removeAllListeners('disconnect');
      // io.removeAllListeners('connection');
    });
  });

  return router;
}
