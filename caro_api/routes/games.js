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
  const { calculateWinner } = require('../utils/gameServices');

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
    // console.log({ game: game[0], player1Name: player1Name[0].Name, player2Name: player2Name[0].Name });
    res.status(200).send({ game: game[0], player1Name: player1Name[0].Name, player2Name: player2Name[0].Name });
  });

  router.get('/get/:ID', async (req, res) => {
    const gameID = req.params.ID;
    const game = await gameModel.getGameByID(gameID);

    if (game) {
      res.status(200).send({ game: game[0] });
    }
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

  const observerOfAGame = new Map();
  let waitingUserForPairing = [];
  const allGamesInfo = new Map();
  const gameIntervals = new Map();

  io.on("connection", async (socket) => {

    socket.on("invite", data => {
      socket.broadcast.emit(`invite_${data.userID}`, { ...data });
    });

    socket.on("game_started", async data => {
      const isXTurn = true;
      const gameInfo = {
        ...allGamesInfo.get(data.gameID),
        elo: data.elo
      }
      allGamesInfo.set(data.gameID, gameInfo);

      //Viết sẳn để hàm set ở dưới mới xài
      const gameInterval = function () {
        return setInterval(async () => {
          const timeRemaining = allGamesInfo.get(data.gameID).counter - 1;
          allGamesInfo.get(data.gameID).counter = timeRemaining;

          if (timeRemaining === 0) {
            console.log("TIME UP");
            clearInterval(gameIntervals.get(data.gameID));
            const [player1, player2] = await Promise.all([
              gameModel.getPlayer1(data.gameID),
              gameModel.getPlayer2(data.gameID)
            ]);
            // update game
            const gameOverAt = new Date().toISOString();
            const game = {
              Player2ID: player2[0].ID,
              Result: gameInfo.isXTurn ? 2 : 1, // X lost
              Status: 0,
              Moves: JSON.stringify(gameInfo.moves),
              ChatHistory: JSON.stringify(gameInfo.chatHistory),
              GameOverAt: convertISOToYMD(gameOverAt),
            }
            await gameModel.updateGame(data.gameID, game);
            // update players' elo
            if (isXTurn) {
              console.log("x thua");
              player1[0].Elo -= data.elo;
              player1[0].PlayCount += 1;
              player2[0].Elo += data.elo;
              player2[0].WinCount += 1;
              player2[0].PlayCount += 1;
            } else {
              console.log("x thắng");
              player1[0].Elo += data.elo;
              player1[0].PlayCount += 1;
              player1[0].WinCount += 1;
              player2[0].Elo -= data.elo;
              player2[0].PlayCount += 1;
            }
            await Promise.all([
              userModel.updateUserScore(player1[0].ID,
                { Elo: player1[0].Elo, WinCount: player1[0].WinCount, PlayCount: player1[0].PlayCount }),
              userModel.updateUserScore(player2[0].ID,
                { Elo: player2[0].Elo, WinCount: player2[0].WinCount, PlayCount: player2[0].PlayCount })
            ]);
            // emit time up
            io.sockets.emit(`time_up_${data.gameID}`, { winner: isXTurn ? "O" : "X", elo: data.elo, player1: player1[0], player2: player2[0] });
            gameIntervals.delete(data.gameID);
            allGamesInfo.delete(data.gameID);
          }
          else {
            console.log(timeRemaining);
          }
        }, 1000);
      }

      if (gameIntervals.has(data.gameID) === false) {
        gameIntervals.set(data.gameID, gameInterval());
        await gameModel.updateGame(data.gameID, { Status: 2 });
      }

      io.sockets.emit(`game_started_${data.gameID}`, { counter: gameInfo.counter, player1ID: data.player1ID });
    });

    socket.on("move", async data => {
      clearInterval(gameIntervals.get(data.gameID));
      gameIntervals.delete(data.gameID);
      const gameInfo = allGamesInfo.get(data.gameID);
      const history = JSON.parse(JSON.stringify(data.history));
      gameInfo.moves = history;
      gameInfo.isXTurn = data.isXTurn;
      gameInfo.counter = gameInfo.timeThinkingEachTurn;

      socket.broadcast.emit(`load_moves_${data.gameID}`, {
        history: data.history,
        player: data.player,
        playerID: data.playerID,
        opponentID: data.opponentID,
        isYourTurn: data.isYourTurn,
        counter: gameInfo.counter,
        // game: data.game
      });

      const newestMove = history[history.length - 1];
      const winInfo = calculateWinner(newestMove.squares, newestMove.position, data.isBlockedRule)
      const [player1, player2] = await Promise.all([
        gameModel.getPlayer1(data.gameID),
        gameModel.getPlayer2(data.gameID)
      ]);

      if (winInfo.winner !== null) { // đã có thắng thua
        // update  game
        const gameOverAt = new Date().toISOString();
        const game = {
          Player2ID: player2[0].ID,
          Result: winInfo.winner === "X" ? 1 : 2, // X won
          Status: 0,
          Moves: JSON.stringify(gameInfo.moves),
          ChatHistory: JSON.stringify(gameInfo.chatHistory),
          GameOverAt: convertISOToYMD(gameOverAt),
        }
        await gameModel.updateGame(data.gameID, game);

        // update players' elo
        if (winInfo.winner === "X") {
          console.log("x thắng");
          player1[0].Elo += gameInfo.elo;
          player1[0].PlayCount += 1;
          player1[0].WinCount += 1;
          player2[0].Elo -= gameInfo.elo;
          player2[0].PlayCount += 1;
        } else {
          console.log("x thua");
          player1[0].Elo -= gameInfo.elo;
          player1[0].PlayCount += 1;
          player2[0].Elo += gameInfo.elo;
          player2[0].WinCount += 1;
          player2[0].PlayCount += 1;
        }
        await Promise.all([
          userModel.updateUserScore(player1[0].ID, { Elo: player1[0].Elo, WinCount: player1[0].WinCount, PlayCount: player1[0].PlayCount }),
          userModel.updateUserScore(player2[0].ID, { Elo: player2[0].Elo, WinCount: player2[0].WinCount, PlayCount: player2[0].PlayCount })
        ]);

        // emit thông báo tới room
        io.sockets.emit(`game_over_${data.gameID}`, {
          winner: winInfo.winner, elo: gameInfo.elo, player1: player1[0], player2: player2[0]
        });
        io.sockets.emit(`remove_game`, { gameID: data.gameID });
        gameIntervals.delete(data.gameID);
        allGamesInfo.delete(data.gameID);

      } else if (winInfo.isDraw) {// Draw

        const gameOverAt = new Date().toISOString();
        const game = {
          Player2ID: player2[0].ID,
          Result: 0, // draw
          Status: 0,
          Moves: JSON.stringify(gameInfo.moves),
          ChatHistory: JSON.stringify(gameInfo.chatHistory),
          GameOverAt: convertISOToYMD(gameOverAt),
        }
        await gameModel.updateGame(data.gameID, game);
        // update players' elo
        player1[0].Elo += 1;
        player1[0].PlayCount += 1;
        player2[0].Elo += 1;
        player2[0].PlayCount += 1;

        await Promise.all([
          userModel.updateUserScore(player1[0].ID, { Elo: player1[0].Elo, WinCount: player1[0].WinCount, PlayCount: player1[0].PlayCount }),
          userModel.updateUserScore(player2[0].ID, { Elo: player2[0].Elo, WinCount: player2[0].WinCount, PlayCount: player2[0].PlayCount })
        ]);

        io.sockets.emit(`game_over_${data.gameID}`, { winner: null, elo: 1, player1: player1[0], player2: player2[0] });
        io.sockets.emit(`remove_game`, { gameID: data.gameID });
      } else {
        // chưa có người thắng thua, thì tạo interval mới cho game đó
        const gameInterval = function () {

          return setInterval(async () => {

            const timeRemaining = allGamesInfo.get(data.gameID).counter - 1;
            allGamesInfo.get(data.gameID).counter = timeRemaining;

            if (timeRemaining === 0) {
              console.log("TIME UP");
              clearInterval(gameIntervals.get(data.gameID));

              // update game
              const gameOverAt = new Date().toISOString();
              const game = {
                Player2ID: player2[0].ID,
                Result: gameInfo.isXTurn ? 2 : 1, // X lost
                Status: 0,
                Moves: JSON.stringify(gameInfo.moves),
                ChatHistory: JSON.stringify(gameInfo.chatHistory),
                GameOverAt: convertISOToYMD(gameOverAt),
              }
              await gameModel.updateGame(data.gameID, game);

              // update players' elo
              if (data.isXTurn) {
                console.log("x thua");
                player1[0].Elo -= gameInfo.elo;
                player1[0].PlayCount += 1;
                player2[0].Elo += gameInfo.elo;
                player2[0].WinCount += 1;
                player2[0].PlayCount += 1;
              } else {
                console.log("x thắng");
                player1[0].Elo += gameInfo.elo;
                player1[0].PlayCount += 1;
                player1[0].WinCount += 1;
                player2[0].Elo -= gameInfo.elo;
                player2[0].PlayCount += 1;
              }
              await Promise.all([
                userModel.updateUserScore(player1[0].ID, { Elo: player1[0].Elo, WinCount: player1[0].WinCount, PlayCount: player1[0].PlayCount }),
                userModel.updateUserScore(player2[0].ID, { Elo: player2[0].Elo, WinCount: player2[0].WinCount, PlayCount: player2[0].PlayCount })
              ]);

              // emit time up
              io.sockets.emit(`time_up_${data.gameID}`, { winner: gameInfo.isXTurn ? "O" : "X", elo: gameInfo.elo, player1: player1[0], player2: player2[0] });
              gameIntervals.delete(data.gameID);
              allGamesInfo.delete(data.gameID);
            }
            else {
              console.log(timeRemaining);
            }
          }, 1000);
        }
        // gameIntervals.delete(data.gameID);
        if (gameIntervals.has(data.gameID) === false) {
          gameIntervals.set(data.gameID, gameInterval());
        }
      }
    });

    socket.on("chat", data => {
      const gameInfo = allGamesInfo.get(data.gameID);
      gameInfo.chatHistory = gameInfo.chatHistory.concat([data.message]);
      socket.broadcast.emit(`load_chat_${data.gameID}`, { message: data.message });
    });

    socket.on("join_game", async (data) => {

      const gameStatus = await gameModel.getGameStatusByID(data.gameID);
      const mainPlayers = await gameModel.getPlayers(data.gameID);
      const gameInfo = allGamesInfo.get(data.gameID);
      console.log(gameInfo);

      // game chưa bắt đầu
      if (gameStatus[0].Status === 1) {

        if (mainPlayers.length === 2) {  // bạn là khán giả

          const addResult = trackGameObservers.addObserverToMap(observerOfAGame, data.gameID, data.userID);
          const joinerName = await userModel.getUserNameByID(data.userID);
          const message = {
            ownerID: null,
            message: joinerName[0].Name + " has joined the game"
          }
          gameInfo.chatHistory = gameInfo.chatHistory.concat([message]);

          // if (addResult === 1) {
          const observerIDsIterator = observerOfAGame.get(data.gameID).keys();
          const observerIDs = Array.from(observerIDsIterator)
          const result = observerIDs.map(id => "'" + id.replace("'", "''") + "'").join();
          const observers = await userModel.getUsersByIDsLite(result);
          const game = await gameModel.getGameByID(data.gameID);

          io.sockets.emit(`notify_join_game_${data.gameID}`, {
            isMainPlayer: false,
            player1: mainPlayers[0],//chưa biết ai là player1 player2
            player2: mainPlayers[1],//chưa biết ai là player1 player2
            observers,
            userID: data.userID,
            game: game[0],
            player1Ready: gameInfo.player1Ready,
            player2Ready: gameInfo.player2Ready,
            chatHistory: gameInfo.chatHistory
          });

          // io.sockets.emit(`I_need_game_info_${data.gameID}_${game[0].Player1ID}`, {
          //   userID: data.userID
          // });
          // }
        } else {// sẽ là người chơi thứ 2

          await gameModel.updateGame(data.gameID, { Player2ID: data.userID });
          const [player1, player2, game] = await Promise.all([
            gameModel.getPlayer1(data.gameID),
            gameModel.getPlayer2(data.gameID),
            gameModel.getGameByID(data.gameID)
          ]);
          const message = {
            ownerID: null,
            message: player2[0].Name + " has joined the game"
          }
          gameInfo.chatHistory = gameInfo.chatHistory.concat([message]);

          io.sockets.emit(`notify_join_game_${data.gameID}`, {
            isMainPlayer: true,
            observers: [],
            player1: player1[0],
            player2: player2[0],
            userID: data.userID,
            game: game[0],
            chatHistory: gameInfo.chatHistory
          });
          // io.sockets.emit(`I_need_game_info_${data.gameID}_${game[0].Player1ID}`, {
          //   userID: data.userID
          // });
        }
      }
      else if (gameStatus[0].Status === 2) {// game đã bắt đầu

        const [game, joinerName] = await Promise.all([
          gameModel.getGameByID(data.gameID),
          userModel.getUserNameByID(data.userID)
        ]);
        const message = {
          ownerID: null,
          message: joinerName[0].Name + " has joined the game",
        }
        gameInfo.chatHistory = gameInfo.chatHistory.concat([message]);

        if (data.userID === game[0].Player1ID || data.userID === game[0].Player2ID) {// là người chơi chính
          let observers = [];
          if (observerOfAGame.has(data.gameID)) {
            const observerIDsIterator = observerOfAGame.get(data.gameID).keys();
            const observerIDs = Array.from(observerIDsIterator);
            const result = observerIDs.map(id => "'" + id.replace("'", "''") + "'").join();
            observers = await userModel.getUsersByIDsLite(result);
          }

          io.sockets.emit(`notify_join_game_${data.gameID}`, {
            isMainPlayer: true,
            observers,
            player1: mainPlayers[0],// do ko biết được thứ tự player1 hay player2 là dòng nào,
            player2: mainPlayers[1],// nên cần kiểm tra bằng ID của người join vào phòng (data.userID)
            userID: data.userID,
            game: game[0],
            chatHistory: gameInfo.chatHistory,
            moves: gameInfo.moves,
            isXTurn: gameInfo.isXTurn,
            counter: gameInfo.counter
          });

        } else {// là người quan sát
          const addResult = trackGameObservers.addObserverToMap(observerOfAGame, data.gameID, data.userID);
          const observerIDsIterator = observerOfAGame.get(data.gameID).keys();
          const observerIDs = Array.from(observerIDsIterator);
          const result = observerIDs.map(id => "'" + id.replace("'", "''") + "'").join();
          const observers = await userModel.getUsersByIDsLite(result);

          io.sockets.emit(`notify_join_game_${data.gameID}`, {
            // isMainPlayer: false,
            observers,
            player1: mainPlayers[0],// do ko biết được thứ tự player1 hay player2 là dòng nào,
            player2: mainPlayers[1],// nên cần kiểm tra bằng ID của người join vào phòng (data.userID)
            userID: data.userID,
            game: game[0],
            chatHistory: gameInfo.chatHistory,
            moves: gameInfo.moves,
            isXTurn: gameInfo.isXTurn,
            counter: gameInfo.counter
          });
        }
      }
    });

    socket.on("ready", data => {
      const gameInfo = allGamesInfo.get(data.gameID);

      if (data.userID === data.game.Player1ID) {
        gameInfo.player1Ready = data.player1.player1Ready;
      }
      if (data.userID === data.game.Player2ID) {
        gameInfo.player2Ready = data.player1.player1Ready;
      }
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

          if (newUser.userID === waitingUserForPairing[i].userID) // chính nó bắt cặp với nó
            continue;

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

            // 2. emit cho người thứ 1
            io.sockets.emit(`pair_successfully_${waitingUserForPairing[i].userID}`, { gameID: newGame.ID });

            // 3. emit cho người thứ 2
            await gameModel.updateGame(newGame.ID, { Player2ID: newUser.userID });
            const [player1, player2, game] = await Promise.all([
              gameModel.getPlayer1(newGame.ID),
              gameModel.getPlayer2(newGame.ID),
              gameModel.getGameByID(newGame.ID)
            ]);

            io.sockets.emit(`pair_successfully_${newUser.userID}`, { gameID: newGame.ID });
            allGamesInfo.set(newGame.ID, {
              moves: [{
                squares: Array(0).fill(null),
                position: -1
              }],
              chatHistory: [{
                ownerID: null,
                message: player2[0].Name + " has joined the game"
              }],
              isXTurn: true,
              timeThinkingEachTurn: newGame.TimeThinkingEachTurn,
              counter: newGame.TimeThinkingEachTurn,
              player1Ready: false,
              player2Ready: false,
            });
            // 4. thông báo cho người trong phòng biết
            io.sockets.emit(`notify_join_game_${newGame.ID}`, {
              isMainPlayer: true,
              observers: [],
              player1: player1[0],
              player2: player2[0],
              userID: newUser.userID,
              game: game[0],
              chatHistory: allGamesInfo.get(newGame.ID).chatHistory
            });
            // 5. xóa người thứ 1 khỏi hàng đợi
            waitingUserForPairing.splice(i, 1);

            // 6. Cập nhật game này vào game board của front end
            newGame.Player2ID = newUser.userID;
            io.sockets.emit("server_NewGame", { msg: "Game created", game: newGame });

            /* end */
          } else { // cho chờ
            waitingUserForPairing.push(newUser);
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

    socket.on("leave_game", async data => {

      console.log(data);
      const { gameID, userID, name } = data;

      const gameStatus = await gameModel.getGameStatusByID(gameID);
      const gameInfo = allGamesInfo.get(gameID);
      console.log(gameStatus[0]);
      if (gameStatus[0].Status === 0) {  // thì ko cần làm gì cả
        return;
      }

      const message = {
        ownerID: null,
        message: name + " has left the game."
      }
      gameInfo.chatHistory = gameInfo.chatHistory.concat([message]);

      const [Player1, Player2] = await Promise.all([
        gameModel.getPlayer1(gameID),
        gameModel.getPlayer2(gameID),
      ]);
      const player1 = Player1[0];
      const player2 = Player2.length === 0 ? null : Player2[0];

      // game đang chờ thì người chơi chính rời phòng sẽ cần cập nhật
      if (gameStatus[0].Status === 1 && (userID === player1.ID || userID === player2.ID)) {
        gameInfo.player1Ready = false;
        gameInfo.player2Ready = false;
        if (userID === player1.ID) {

          if (player2 === null) {
            await gameModel.deleteGame(gameID);
            io.sockets.emit(`remove_game`, { gameID });
            return;
          }
          // player2 != null
          await gameModel.updateGame(data.gameID, { Player1ID: player2.ID, Player2ID: null });
          const game = await gameModel.getGameByID(data.gameID);
          io.sockets.emit(`leave_game_${data.gameID}`, {
            game: game[0],
            chatHistory: gameInfo.chatHistory
          });

        } else if (userID === player2.ID) {
          await gameModel.updateGame(data.gameID, { Player2ID: null });
          const game = await gameModel.getGameByID(data.gameID);
          io.sockets.emit(`leave_game_${data.gameID}`, {
            game: game[0],
            chatHistory: gameInfo.chatHistory
          });
        }
        return;
      }

      // observer rời khi game đang chờ or đang chơi sẽ cần cập nhật
      if (userID !== player1.ID && userID !== player2.ID) {

        trackGameObservers.removeObserverFromMap(observerOfAGame, gameID, userID);
        let observers = [];
        if (observerOfAGame.has(gameID)) {
          const observerIDsIterator = observerOfAGame.get(data.gameID).keys();
          const observerIDs = Array.from(observerIDsIterator);
          const result = observerIDs.map(id => "'" + id.replace("'", "''") + "'").join();
          observers = await userModel.getUsersByIDsLite(result);
        }
        socket.broadcast.emit(`observer_leave_game_${gameID}`, { observers, chatHistory: gameInfo.chatHistory });
      }


    });

    // chưa cập nhật giao diện bên front-end
    // socket.on("owner_leave_game", async data => {
    //   console.log("owner leaves game");
    //   console.log(data);
    //   const newGame = {
    //     ...data.game,
    //     Player1ID: data.opponentID,
    //     Player2ID: null
    //   }
    //   await gameModel.updateGame(data.game.ID, {
    //     Player1ID: newGame.Player1ID,
    //     Player2ID: newGame.Player2ID
    //   });
    //   socket.broadcast.emit(`owner_leave_game_${data.game.ID}`, { game: newGame });
    // });

    socket.on("client_NewGame", async data => {
      const { name, password, isBlockedRule, timeThinkingEachTurn, userID } = data;
      if (isBlankString(name)) {
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
      allGamesInfo.set(newGame.ID, {
        moves: [{
          squares: Array(0).fill(null),
          position: -1
        }],
        chatHistory: [],
        isXTurn: true,
        timeThinkingEachTurn: timeThinkingEachTurn,
        counter: timeThinkingEachTurn,
        player1Ready: false,
        player2Ready: false,
      });

      if (result.affectedRows === 0) {
        io.sockets.emit(`newGameFail${userID}`, { msg: "Fail to create game" });
      } else {
        io.sockets.emit("server_NewGame", { msg: "Game created", game: newGame });
      }
    });

    socket.on("draw_request", data => {
      socket.broadcast.emit(`received_draw_request_${data.gameID}`, { to: data.to });
    });

    socket.on("surrender_request", data => {
      socket.broadcast.emit(`received_surrender_request_${data.gameID}`, { to: data.to });
    });

    socket.on("deny_request", data => {
      socket.broadcast.emit(`request_denied_${data.gameID}`, { to: data.to });
    });

    socket.on("accept_request", async data => {

      const gameInfo = allGamesInfo.get(data.gameID);
      const [player1, player2] = await Promise.all([
        gameModel.getPlayer1(data.gameID),
        gameModel.getPlayer2(data.gameID)
      ]);
      const gameOverAt = new Date().toISOString();
      clearInterval(gameIntervals.get(data.gameID));

      if (data.drawOrSurrender === "draw") {
        const game = {
          Player2ID: player2[0].ID,
          Result: 0, // draw
          Status: 0,
          Moves: JSON.stringify(gameInfo.moves),
          ChatHistory: JSON.stringify(gameInfo.chatHistory),
          GameOverAt: convertISOToYMD(gameOverAt),
        }
        await gameModel.updateGame(data.gameID, game);
        // update players' elo
        player1[0].Elo += 1;
        player1[0].PlayCount += 1;
        player2[0].Elo += 1;
        player2[0].PlayCount += 1;

        await Promise.all([
          userModel.updateUserScore(player1[0].ID,
            { Elo: player1[0].Elo, WinCount: player1[0].WinCount, PlayCount: player1[0].PlayCount }),
          userModel.updateUserScore(player2[0].ID,
            { Elo: player2[0].Elo, WinCount: player2[0].WinCount, PlayCount: player2[0].PlayCount })
        ]);

        io.sockets.emit(`game_over_${data.gameID}`, {
          winner: null, elo: 1, player1: player1[0], player2: player2[0]
        });
      }
      else if (data.drawOrSurrender === "surrender") {
        const game = { // update game
          Player2ID: player2[0].ID,
          Result: data.to === player1[0].ID ? 2 : 1,
          Status: 0,
          Moves: JSON.stringify(gameInfo.moves),
          ChatHistory: JSON.stringify(gameInfo.chatHistory),
          GameOverAt: convertISOToYMD(gameOverAt),
        }
        await gameModel.updateGame(data.gameID, game);
        // update players' elo
        if (game.Result === 1) {
          console.log("x thắng");
          player1[0].Elo += gameInfo.elo;
          player1[0].PlayCount += 1;
          player1[0].WinCount += 1;
          player2[0].Elo -= gameInfo.elo;
          player2[0].PlayCount += 1;
        } else {
          console.log("x thua");
          player1[0].Elo -= gameInfo.elo;
          player1[0].PlayCount += 1;
          player2[0].Elo += gameInfo.elo;
          player2[0].WinCount += 1;
          player2[0].PlayCount += 1;
        }

        await Promise.all([
          userModel.updateUserScore(player1[0].ID,
            { Elo: player1[0].Elo, WinCount: player1[0].WinCount, PlayCount: player1[0].PlayCount }),
          userModel.updateUserScore(player2[0].ID,
            { Elo: player2[0].Elo, WinCount: player2[0].WinCount, PlayCount: player2[0].PlayCount })
        ]);

        io.sockets.emit(`game_over_${data.gameID}`, {
          winner: game.Result === 1 ? "X" : "O", elo: gameInfo.elo, player1: player1[0], player2: player2[0]
        });
      }
      gameIntervals.delete(data.gameID);
      allGamesInfo.delete(data.gameID);
    });
  });

  return router;
}
