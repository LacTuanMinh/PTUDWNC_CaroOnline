module.exports = io => {
  const express = require('express');
  const router = express.Router();
  const { v1: uuidv1 } = require('uuid');
  const dockerNames = require('docker-names');
  const gameModel = require('../models/gameModel');
  const userModel = require('../models/userModel');
  const v1options = {
    msecs: Date.now(),
  };
  uuidv1(v1options);
  const trackGameObservers = require('../utils/trackGameObservers');
  const { isBlankString, convertISOToYMD, canBePaired } = require('../utils/helper');

  const observerOfAGame = new Map();

  router.get('/', async (req, res) => {
    const games = await gameModel.getAllGames();
    res.status(200).send({ games });
  });

  router.get('/playedGames/:userID', async (req, res) => {

    const userID = req.params.userID;
    const games = await gameModel.getAllGamesByUserID(userID);

    res.status(200).send({ list: games });
  });

  router.get('/playedGameDetail/:ID', async (req, res) => {
    const gameID = req.params.ID;
    const game = await gameModel.getGameByID(gameID);

    const [player1Name, player2Name] = await Promise.all([
      userModel.getUserNameByID(game[0].Player1ID),
      userModel.getUserNameByID(game[0].Player2ID),
    ]);
    console.log({ game: game[0], player1Name: player1Name[0].Name, player2Name: player2Name[0].Name });
    res.status(200).send({ game: game[0], player1Name: player1Name[0].Name, player2Name: player2Name[0].Name });
  });

  router.get('/get/:ID', async (req, res) => {
    const gameID = req.params.ID;
    const game = await gameModel.getGameByID(gameID);

    if (game) {
      // console.log(game[0]);
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
    const updatedGame = {
      ...game,
      Player2ID: player2ID,
      Result: result,
      Status: status,
      Moves: moves,
      ChatHistory: chatHistory
    }
    const gameOverAt = new Date().toISOString();
    await gameModel.updateGame(game.ID, {
      Player2ID: updatedGame.Player2ID,
      Result: updatedGame.Result,
      Status: updatedGame.Status,
      Moves: updatedGame.Moves,
      ChatHistory: updatedGame.ChatHistory,
      GameOverAt: convertISOToYMD(gameOverAt),
    });
    return res.status(200).send({ msg: 'game info updated', game: updatedGame });
  });

  let waitingUserForPairing = [];
  const gameInfo = new Map();

  io.on("connection", async (socket) => {
    // let myInterval = setInterval(() => {
    //   const countDown = Math.ceil((gameInfo.get(gameID).timeUpAt - Date.now()) / 1000);
    //   if (countDown === 0) {
    //     console.log("TIME UP");
    //     clearInterval(myInterval);
    //   }
    //   else {
    //     console.log(countDown);
    //   }
    // }, 1000);

    socket.on("invite", data => {
      socket.broadcast.emit(`invite_${data.userID}`, { ...data });
    });

    socket.on("game_started", data => {
      const timeUpAt = Date.now() + data.timeThinkingEachTurn * 1000;
      const isXTurn = true;
      gameInfo.set(data.gameID, { 
        moves: [],
        chatHistory: data.chatHistory,
        isXTurn,
        elo: data.elo,
        timeUpAt,
        myInterval: setInterval(async () => {
          const countDown = Math.round((timeUpAt - Date.now()) / 1000);
          if (countDown === 0) {
            console.log("TIME UP");

            const [player1, player2] = await Promise.all([
              gameModel.getPlayer1(data.gameID),
              gameModel.getPlayer2(data.gameID)
            ]);

            // update game
            const game = {
              Player2ID: player2.ID,
              Result: isXTurn ? 2 : 1, // X lost
              Status: 0,
              Moves: JSON.stringify([]),
              ChatHistory: JSON.stringify(data.chatHistory)
            }
            gameModel.updateGame(data.gameID, game);

            // emit time up
            io.sockets.emit(`time_up_${data.gameID}`, 
              { winner: isXTurn ? "X" : "O", elo: data.elo, player1, player2 });
            
            // update players' elo
            if (isXTurn) {
              player1.Elo -= data.elo;
              player1.PlayCount += 1;

              player2.Elo += data.elo;
              player2.WinCount += 1;
              player2.PlayCount += 1;
            }

            await userModel.updateUserScore(player1.ID, 
              { Elo: player1.Elo, WinCount: player1.WinCount, PlayCount: player1.PlayCount });
            await userModel.updateUserScore(player2.ID, 
              { Elo: player2.Elo, WinCount: player2.WinCount, PlayCount: player2.PlayCount });

            clearInterval(myInterval);
          }
          else {
            console.log(countDown);
          }
        }, 1000)
      });

      io.sockets.emit(`game_started_${data.gameID}`, { timeUpAt: gameInfo.get(data.gameID).timeUpAt });
    });

    socket.on("move", data => {
      const timeUpAt = Date.now() + data.timeThinkingEachTurn * 1000;
      // console.log(data);
      const gameData = gameInfo.get(data.gameID);
      gameInfo.set(data.gameID, { 
        ...gameData,
        moves: data.history,
        isXTurn: !data.isXTurn,
        timeUpAt,
        myInterval: setInterval(async () => {
          const countDown = Math.round((timeUpAt - Date.now()) / 1000);
          if (countDown === 0) {
            console.log("TIME UP");

            const [player1, player2] = await Promise.all([
              gameModel.getPlayer1(data.gameID),
              gameModel.getPlayer2(data.gameID)
            ]);

            // update game
            const game = {
              Player2ID: player2.ID,
              Result: isXTurn ? 2 : 1, // X lost
              Status: 0,
              Moves: JSON.stringify(data.history),
              ChatHistory: JSON.stringify(gameData.chatHistory)
            }
            gameModel.updateGame(data.gameID, game);
            
            // emit time up
            io.sockets.emit(`time_up_${data.gameID}`, { winner: data.isXTurn ? "X" : "O", elo: data.elo });
            
            // update players' elo

            if (data.isXTurn) {
              player1.Elo -= data.elo;
              player1.PlayCount += 1;

              player2.Elo += data.elo;
              player2.WinCount += 1;
              player2.PlayCount += 1;
            }
            
            await userModel.updateUserScore(player1.ID, 
              { Elo: player1.Elo, WinCount: player1.WinCount, PlayCount: player1.PlayCount });
            await userModel.updateUserScore(player2.ID, 
              { Elo: player2.Elo, WinCount: player2.WinCount, PlayCount: player2.PlayCount });

            clearInterval(gameData.myInterval);
          }
          else if (count > 0) {
            console.log(countDown);
          }
        }, 1000)
      });

      socket.broadcast.emit(`load_moves_${data.gameID}`,
        {
          history: data.history,
          player: data.player,
          playerID: data.playerID,
          opponentID: data.opponentID,
          isYourTurn: data.isYourTurn,
          timeUpAt: gameInfo.get(data.gameID).timeUpAt,
          game: data.game
        });
    });

    socket.on("chat", data => {
      // console.log(data);
      const gameData = gameInfo.get(data.gameID);
      gameInfo.set(data.gameID, { 
        ...gameData,
        chatHistory: chatHistory.concat(data.message)
      });
      socket.broadcast.emit(`load_chat_${data.gameID}`, { message: data.message });
    });

    socket.on("join_game", async data => {
      const originPlayers = await gameModel.getPlayers(data.gameID);
      // game status === 2 means playing

      if (originPlayers.length === 2) {  // there is already opponent 
        console.log('khán giả');

        const addResult = trackGameObservers.addObserverToMap(observerOfAGame, data.gameID, data.userID);

        if (addResult === 1) {
          const observerIDsIterator = observerOfAGame.get(data.gameID).keys();
          const observerIDs = Array.from(observerIDsIterator)
          const result = observerIDs.map(id => {
            return "'" + id.replace("'", "''") + "'";
          }).join();

          const observers = await userModel.getUsersByIDsLite(result);
          const game = await gameModel.getGameByID(data.gameID);

          io.sockets.emit(`notify_join_game_${data.gameID}`, {
            isMainPlayer: false,
            player1: originPlayers[0],
            player2: originPlayers[1],
            observers,
            userID: data.userID,
            game: game[0]
          });

          io.sockets.emit(`I_need_game_info_${data.gameID}_${game[0].Player1ID}`, {
            userID: data.userID
          });
        }
        return;
      }

      //else : là người chơi thứ 2
      await gameModel.updateGame(data.gameID, { Player2ID: data.userID });
      const players = await gameModel.getPlayers(data.gameID);
      const game = await gameModel.getGameByID(data.gameID);
      io.sockets.emit(`notify_join_game_${data.gameID}`, {
        isMainPlayer: true,
        // do ko biết được thứ tự player1 hay player2 là dòng nào,
        // nên cần kiểm tra bằng ID của người join vào phòng (data.userID)
        observers: [],
        player1: data.userID === players[0].ID ? players[1] : players[0],
        player2: data.userID === players[0].ID ? players[0] : players[1],
        userID: data.userID,
        game: game[0]
      });

      io.sockets.emit(`I_need_game_info_${data.gameID}_${game[0].Player1ID}`, {
        userID: data.userID
      });
    });

    socket.on(`I_provide_game_info`, (data) => {
      io.sockets.emit(`receive_your_data_${data.gameID}_${data.userID}`, {
        chatHistory: data.chatHistory,
        moves: data.moves
      });
    });

    socket.on("ready", data => {
      console.log(data);
      socket.broadcast.emit(`ready_${data.gameID}`, data);
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
      await userModel.updateUserScore(data.player.ID,
        { Elo: newPlayer.Elo, WinCount: newPlayer.WinCount, PlayCount: newPlayer.PlayCount });
      socket.broadcast.emit(`timeup_${data.game.ID}`,
        { game: data.game, player2: newPlayer, player1ID: data.player2ID, winnerID: data.win ? data.player.ID : data.player2ID });
    });

    socket.on("find_opponent", async (data) => {

      const info = await userModel.getUserByID(data.userID);
      const newUser = { userID: data.userID, elo: info[0].Elo }

      if (waitingUserForPairing.length === 0) { // không có ai đang chờ ghép cặp
        waitingUserForPairing.push(newUser);
        return;

      } else { // có người chờ ghép cặp

        for (let i = 0; i < waitingUserForPairing.length; i++) {

          if (canBePaired(newUser.elo, waitingUserForPairing[i].elo)) { // khoảng cách elo ok
            /* hero unit */
            // 1. tạo phòng mới và thêm vào db
            const newGame = {
              ID: uuidv1(),
              Name: dockerNames.getRandomName(),
              Password: null,
              IsBlockedRule: false,
              TimeThinkingEachTurn: 60,
              Moves: null,
              Status: 1,  // waiting
              Player1ID: waitingUserForPairing[i].userID,
              Player2ID: null,
              Result: null
            }
            const result = await gameModel.addGame(newGame);
            // if (result.affectedRows === 0) {
            //   io.sockets.emit(`newGameFail${userID}`, { msg: "Fail to create game" });
            //   return;
            // }
            // 2. emit cho người thứ 1
            // io.sockets.emit("server_NewGame", { msg: "Game created", game: newGame });
            io.sockets.emit(`pair_successfully_${waitingUserForPairing[i].userID}`, { gameID: newGame.ID });

            // 3. emit cho người thứ 2
            await gameModel.updateGame(newGame.ID, { Player2ID: newUser.userID });
            const players = await gameModel.getPlayers(newGame.ID);
            const game = await gameModel.getGameByID(newGame.ID);
            io.sockets.emit(`pair_successfully_${newUser.userID}`, { gameID: newGame.ID });

            // 4. thông báo cho người thứ 1 biết
            io.sockets.emit(`notify_join_game_${newGame.ID}`, {
              isMainPlayer: true,
              // do ko biết được thứ tự player1 hay player2 là dòng nào,
              // nên cần kiểm tra bằng ID của người join vào phòng (data.userID)
              observers: [],
              player1: newUser.userID === players[0].ID ? players[1] : players[0],
              player2: newUser.userID === players[0].ID ? players[0] : players[1],
              userID: newUser.userID,
              game: game[0]
            });
            // 5. xóa người thứ 1 khỏi hàng đợi
            waitingUserForPairing.splice(i, 1);
            console.log(waitingUserForPairing);
            return;
            /* end */
          } else { // cho chờ
            waitingUserForPairing.push(newUser);
            return;
          }
        }
      }
    });

    socket.on('remove_pairing', (data) => {
      for (let i = 0; i < waitingUserForPairing.length; i++) {
        if (waitingUserForPairing[i].userID === data.userID) {
          waitingUserForPairing.splice(i, 1);
          console.log(waitingUserForPairing);
          return;
        }
      }
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

    // chưa cập nhật giao diện bên front-end
    socket.on("owner_leave_game", async data => {
      console.log("owner leaves game");
      console.log(data);
      const newGame = {
        ...data.game,
        Player1ID: data.opponentID,
        Player2ID: null
      }
      await gameModel.updateGame(data.game.ID, {
        Player1ID: newGame.Player1ID,
        Player2ID: newGame.Player2ID
      });
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
      gameInfo.set(newGame.ID, { 
        moves: [],
        chatHistory: [],
        isXTurn: true,
        timeUpAt: 0
      });

      if (result.affectedRows === 0) {
        io.sockets.emit(`newGameFail${userID}`, { msg: "Fail to create game" });
      } else {
        io.sockets.emit("server_NewGame", { msg: "Game created", game: newGame });
      }
    });
  });

  return router;
}
