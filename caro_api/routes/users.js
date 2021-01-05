module.exports = function (io) { // catch here

  const express = require('express');
  const router = express.Router();
  const bcrypt = require('bcryptjs');
  const userModel = require('../models/userModel');
  const trackUserOnline = require('../utils/trackUserOnline');
  const multer = require('multer');
  const fs = require('fs');
  const path = require('path');
  const util = require("util");
  const rename = util.promisify(fs.rename);
  const unlink = util.promisify(fs.unlink);
  const config = require('../config/default.json');
  const { mapEloToMedal, convertISOToYMD } = require('../utils/helper');
  const storage = multer.diskStorage({

    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname);// make filename unique in images folder (if happen)
    },
    destination: function (req, file, cb) {
      cb(null, `./public/images/userAvatars`);
    },
  });
  const upload = multer({ storage });

  router.use(express.static('public'));

  router.post('/authenticate', (req, res) => {
    console.log("authenticated");
    return res.status(200).send({ mesg: "ok" });
  });

  router.get('/get/:ID', async (req, res) => {
    const userID = req.params.ID;
    const user = await userModel.getUserByID(userID);
    console.log(user[0]);
    if (user) {
      res.status(200).send({ player1: user[0] });
    }
    //else res.status(404).send()
  });

  router.post('/update', async (req, res) => {
    const { player1, win, elo, player2ID } = req.body;

    const entity = {
      ...player1,
      Elo: player1.Elo + (win ? elo : -elo),
      WinCount: player1.WinCount + (win ? 1 : 0),
      PlayCount: player1.PlayCount + 1
    }
    console.log('entity', entity);

    await userModel.updateUserScore(player1.ID, { Elo: entity.Elo, WinCount: entity.WinCount, PlayCount: entity.PlayCount });
    const player2 = await userModel.getUserByID(player2ID);
    return res.status(200).send({ msg: "Players updated", player1: entity, player2: player2[0] });
  });

  router.post('/signout', async (req, res) => {

    const { userID } = req.body;
    const affectedRow = await userModel.updateUserStatus(userID, 0);

    if (affectedRow === 0) {
      res.status(400).send({ mesg: 'Failed to sign out' });
    } else res.status(200).send({ mesg: 'Successful' });

  })

  router.get('/profile/:userID', async (req, res) => {
    const userID = req.params.userID;

    const results = await userModel.getUserByID(userID);
    if (results.length === 1) {
      const result = results[0];
      console.log((results));
      delete result.Password;
      delete result.Status;
      delete result.IsAdmin;
      result.medal = await mapEloToMedal(result.Elo);
      res.status(200).send({ userInfo: result });
    } else {
      res.status(400).end();
    }
  })

  router.get('/avatar/:userID', async (req, res) => {

    const userID = req.params.userID;
    const result = await userModel.getUserAvatarByID(userID);

    if (result.length !== 1) { // wrong userID
      return res.status(400).send({ mesg: "Error! Please try later" });
    }

    if (result[0].Avatar === null) { // chưa có avatar
      return res.status(304).end();
    }

    const AvatarURL = result[0].Avatar;
    res.status(200).sendFile(path.join(__dirname, '../public', AvatarURL));
  })

  router.post('/profile/updateinfo/:userID', async (req, res) => {

    const userID = req.params.userID;
    const { Name, Email, DateOfBirth } = req.body;
    console.log(Name, Email, DateOfBirth);
    const formattedDOB = convertISOToYMD(DateOfBirth);

    const result = await userModel.updateUserInfo(userID, { Name, Email, DateOfBirth: formattedDOB });

    console.log(result);

    if (result.affectedRows === 1) {
      res.status(200).send({ mesg: 'ok' });
    } else res.status(400).end();

  });

  router.post('/profile/updatepassword/:userID', async (req, res) => {
    const userID = req.params.userID;
    const { CurrentPassword, NewPassword } = req.body;

    const result = await userModel.getPasswordByID(userID);

    if (result.length === 1) {

      if (bcrypt.compareSync(CurrentPassword, result[0].Password)) { // old password is correct
        const N = config.hashRound;
        const hashedPassword = bcrypt.hashSync(NewPassword, N);
        const updateResult = await userModel.updateUserPassword(userID, { Password: hashedPassword });

        if (updateResult.affectedRows === 1) {
          res.status(200).end();
        } else {
          res.status(400).send({ mesg: "Something wrong when changing password" });
        }

      } else {
        res.status(400).send({ mesg: "Current password is wrong" });
      }

    } else {
      res.status(400).send({ mesg: "Something wrong when changing password" });
    }
  });

  router.post('/profile/updateavatar/:userID', upload.single('avatar'), async (req, res) => {

    const userID = req.params.userID;
    const file = req.file;
    const user = await userModel.getUserByID(userID);

    if (user.length !== 1) {
      return res.status(400).send({ mesg: "Error! Please try later" });
    }

    const prePath = './public/images/userAvatars';

    // nếu người dùng đã có avatar thì xóa avatar cũ
    if (user[0].Avatar !== null) {
      await unlink(`./public/${user[0].Avatar}`);
    }

    const newUrl = `${prePath}/${Date.now()}${userID}` + path.extname(file.originalname);
    const [, result] = await Promise.all([
      rename(`${prePath}/${file.filename}`, newUrl),
      userModel.updateUserAvatar(userID, { Avatar: newUrl.replace('./public/', '') }),
    ]);
    return res.status(200).sendFile(path.join(__dirname, '../public', newUrl.replace('./public/', '')));
  });

  const userSocketIdMap = new Map(); //a map of online usernames and their clients
  userSocketIdMap.clear();

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
      io.sockets.emit("server_RefreshList", list);
    } else {
      const list = await userModel.getAllOnlineUsers();
      io.sockets.emit("server_RefreshList", list);
    }

    socket.on("client_LoggedIn", async (data) => {
      console.log("client logged in", data.userID);
      const addResult = trackUserOnline.addClientToMap(userSocketIdMap, data.userID, socket.id);

      if (addResult === 1) {
        const res = await userModel.updateUserStatus(data.userID, 1);
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
      socket.broadcast.emit("server_RefreshList", list);
    });
  });

  return router;
}
