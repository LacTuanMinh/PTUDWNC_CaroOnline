module.exports = io => { // catch here
  const express = require('express');
  const router = express.Router();
  const { v1: uuidv1 } = require('uuid');
  const gameModel = require('../models/gameModel');
  const v1options = {
    msecs: Date.now(),
  };
  uuidv1(v1options);
  const { isBlankString } = require('../utils/helper');

  router.get('/', async (req, res) => {
    const games = await gameModel.getAllGames();
    // console.log(games);
    res.status(200).send({ games });
  });

  router.get('/get/:ID', async (req, res) => {
    const gameID = req.params.ID;
    const game = await gameModel.getGameByID(gameID);
    // console.log(game[0]);
    if (game) {
      res.status(200).send({ game: game[0] });
    }
    //else res.status(404).send()
  });

  router.post('/joinbyid', async (req, res) => {

    const { gameID, password } = req.body;
    const game = await gameModel.checkGameExistByID(gameID);

    if (game.length !== 1) {
      return res.status(401).send({ msg: 'Wrong game id' });
    }

    if (game[0].Password !== null) {
      if (game[0].Password !== password)
        return res.status(401).send({ msg: 'Wrong password' });
    }

    res.status(200).send({ msg: "ok", gameID })
  });

  router.post('/update', async (req, res) => {


  });
  // router.post('/add', async (req, res) => {
  // const { name, password, isBlockedRule, userID } = req.body;

  // if (name === null || isBlockedRule === null) {
  //   return res.status(400).send({ msg: "Field(s) is empty!!!" });
  // }

  // const newGame = {
  //   ID: uuidv1(),
  //   Name: name,
  //   Password: password,
  //   IsBlockedRule: isBlockedRule,
  //   Moves: null,
  //   Status: 1,  // waiting
  //   Player1ID: userID,
  //   Player2ID: null,
  //   Result: null
  // }
  // const result = await gameModel.addGame(newGame);
  // console.log(result);
  // return res.status(200).send({ msg: "Game created", game: newGame });
  // });

  io.on("connection", async (socket) => {
    socket.on("move", data => {
      console.log(data);
      socket.broadcast.emit(`load_moves_${data.gameID}`, { history: data.history, playerID: data.playerID, isYourTurn: data.isYourTurn });
    });

    socket.on("chat", data => {
      console.log(data);
      socket.broadcast.emit(`load_chat_${data.gameID}`, { message: data.message });
    });

    socket.on("join_game", async data => {
      await gameModel.updateGame(data.gameID, data.userID);
      const players = await gameModel.getPlayers(data.gameID);
      io.sockets.emit(`notify_gameID_${data.gameID}`, {
        gameID: data.gameID,
        // do ko biết được thứ tự player1 hay player2 là dòng nào,
        // nên cần kiểm tra bằng ID của người join vào phòng (data.userID)
        player1: data.userID === players[0].ID ? players[1] : players[0],
        player2: data.userID === players[0].ID ? players[0] : players[1],
        userID: data.userID
      });
    });



    socket.on("client_NewGame", async data => {
      const { name, password, isBlockedRule, userID } = data;

      if (isBlankString(name)) {
        console.log('fail');
        io.sockets.emit(`newGameFail${userID}`, { msg: "Game name is empty!!!" });
        return;
      }

      const newGame = {
        ID: uuidv1(),
        Name: name,
        Password: password,
        IsBlockedRule: isBlockedRule,
        Moves: null,
        Status: 1,  // waiting
        Player1ID: userID,
        Player2ID: null,
        Result: null
      }
      const result = await gameModel.addGame(newGame);

      if (result.affectedRows === 0) {
        io.sockets.emit(`newGameFail${userID}`, { msg: "Fail to create game" });
        return;
      }
      // console.log('thành công', result);
      io.sockets.emit("server_NewGame", { msg: "Game created", game: newGame });
    })

    // socket.on("client_LoggedIn", async (data) => {
    //   console.log("client logged in", data.userID);
    //   await userModel.updateUserStatus(data.userID, 1);// set status to Online (== 1)
    //   const list = await userModel.getAllOnlineUsers();
    //   // console.log("client_LoggedIn", list);
    //   io.sockets.emit("server_RefreshList", list);
    // });
  });

  return router;
}
