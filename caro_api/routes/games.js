module.exports = io => { // catch here
  const express = require('express');
  const router = express.Router();
  const { v1: uuidv1 } = require('uuid');
  const gameModel = require('../models/gameModel');
  const userModel = require('../models/userModel');
  const v1options = {
    msecs: Date.now(),
  };
  uuidv1(v1options);
  const { isBlankString } = require('../utils/helper');

  const observerOfAGame = new Map()
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
    const { game, player2ID, result, status, moves, chatHistory } = req.body;
    console.log('update ', player2ID);
    const updatedGame = {
      ...game,
      Player2ID: player2ID,
      Result: result,
      Status: status,
      Moves: moves,
      ChatHistory: chatHistory
    }
    await gameModel.updateGameAfterPlaying(game.ID, updatedGame.Player2ID, updatedGame.Result, updatedGame.Status, updatedGame.Moves, updatedGame.ChatHistory);
    return res.status(200).send({ msg: 'game info updated', game: updatedGame });
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


      const originPlayers = await gameModel.getPlayers(data.gameID);

      // get game data

      // game status === 2 means playing

      if (originPlayers.length === 2) {  // there is already opponent 
        console.log('khán giả');
        const observer = await userModel.getUserByID(data.userID);
        io.sockets.emit(`notify_gameID_${data.gameID}`, {
          isMainPlayer: false,
          player1: originPlayers[0],
          player2: originPlayers[1],
          observer: observer[0],
          userID: data.userID
        });

        if (observerOfAGame.has(data.gameID) === false)
          observerOfAGame.set(data.gameID, new Set([userID]));
        else observerOfAGame.get(data.gameID).add(userID);

        //đọc database
        return;
      }

      //else game is waiting this opponent 

      await gameModel.updateGame(data.gameID, data.userID);
      const players = await gameModel.getPlayers(data.gameID);
      io.sockets.emit(`notify_gameID_${data.gameID}`, {
        gameID: data.gameID,
        isMainPlayer: true,
        // do ko biết được thứ tự player1 hay player2 là dòng nào,
        // nên cần kiểm tra bằng ID của người join vào phòng (data.userID)
        player1: data.userID === players[0].ID ? players[1] : players[0],
        player2: data.userID === players[0].ID ? players[0] : players[1],
        userID: data.userID
      });
    });

    socket.on("ready", data => {
      console.log(data);
      socket.broadcast.emit(`player2_ready_${data.gameID}`, { value: data.value });
    });

    socket.on("run_out_of_time", async data => {
      console.log("run_out");
      console.log(data);
      const newPlayer = {
        ...data.player,
        Elo: data.player.Elo + (data.win ? data.elo : -data.elo),
        WinCount: data.player.WinCount + (data.win ? 1 : 0),
        PlayCount: data.player.PlayCount + 1
      }
      await userModel.updateUserInfo(data.player.ID,
        { Elo: newPlayer.Elo, WinCount: newPlayer.WinCount, PlayCount: newPlayer.PlayCount });
      socket.broadcast.emit(`timeup_${data.gameID}`,
        { player2: newPlayer, player1ID: data.player2ID, winnerID: data.win ? data.player.ID : data.player2ID });
    });

    // socket.on("leave_game", async data => {
    //   console.log(data);
    //   const newUser = {
    //     ...data.user,
    //     Elo: data.user.Elo - data.elo,
    //     PlayCount: data.user.PlayCount + 1
    //   }
    //   const newOpponent = {
    //     ...data.opponent,
    //     Elo: data.opponent.Elo + data.elo,
    //     WinCount: data.opponent.WinCount + 1,
    //     PlayCount: data.opponent.PlayCount + 1
    //   }
    //   await userModel.updateUserInfo(data.user.ID, { Elo: newUser.Elo, PlayCount: newUser.PlayCount });
    //   await userModel.updateUserInfo(data.opponent.ID,
    //     { Elo: newOpponent.Elo, WinCount: newOpponent.WinCount, PlayCount: newOpponent.PlayCount });
    //   socket.broadcast.emit(`opponent_leave_game_${data.gameID}`, { user: newOpponent });
    // });

    socket.on("owner_leave_game", async data => {
      console.log("owner leaves game");
      console.log(data);
      const newGame = {
        ...data.game,
        Player1ID: data.opponentID,
        Player2ID: null
      }
      await gameModel.updateGameOwner(data.game.ID, newGame.Player1ID, newGame.Player2ID);
      socket.broadcast.emit(`owner_leave_game_${data.game.ID}`, { game: newGame });
    });

    socket.on("client_NewGame", async data => {
      const { name, password, isBlockedRule, timeThinkingEachTurn, userID } = data;

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
        TimeThinkingEachTurn: timeThinkingEachTurn,
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
    });
  });

  return router;
}
