import React, { useState, useEffect } from 'react';
import { Prompt } from 'react-router';
import { useHistory } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import SendMessageIcon from '@material-ui/icons/Send';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import Board from './board';
import Player from '../Player/player';
import Timer from '../Timer/timer';
import { calculateWinner, calculateElo } from './gameServices';
import OnlineUsers from '../OnlineUsers/onlineUsers_Secondary';
import { authen } from '../../utils/helper';
import config from '../../constants/config.json';

const API_URL = config.API_URL_TEST;
const jwtToken = window.localStorage.getItem('jwtToken');

function Game({ socket, onlineUserList }) {
  const pathTokensArray = window.location.toString().split('/');
  const gameID = pathTokensArray[pathTokensArray.length - 1];
  const userID = localStorage.getItem('userID');
  const History = useHistory();

  const [start, setStart] = useState(false);
  const [hasWinner, setHasWinner] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatItemMessage, setChatItemMessage] = useState("");
  const [history, setHistory] = useState([
    {
      squares: Array(0).fill(null),
      position: -1
    }
  ]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [isAscending, setIsAscending] = useState(true);
  const [game, setGame] = useState({});
  const [player1, setPlayer1] = useState({});// when the game has had 2 mainplayer, the 'user' term in others system is observer (cant not play game)
  const [player2, setPlayer2] = useState({
    Name: "Waiting for opponent",
    Elo: 0
  });
  const [observer, setObserver] = useState({});
  const [isMainPlayer, setIsMainPlayer] = useState(true);
  const [isYourTurn, setIsYourTurn] = useState(true);
  const [player, setPlayer] = useState("X");// X || O
  const [player1Ready, setPlayer1Ready] = useState(false);
  const [player2Ready, setPlayer2Ready] = useState(false);

  async function getPlayer(id) {
    const res = await fetch(`${API_URL}/users/get/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`
      }
    });
    const result = await res.json();
    console.log(result);

    setPlayer1(result.player1);
  }

  async function getGame(gameID) {
    const res = await fetch(`${API_URL}/games/get/${gameID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`
      }
    });
    const result = await res.json();
    console.log(result);
    setGame(result.game);
  }

  // update user info
  async function updatePlayersInfo(data) {
    const res = await fetch(`${API_URL}/users/update`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`
      }
    });
    const result = await res.json();
    console.log(result);
    if (res.status === 200) {
      console.log(result.msg);
      setPlayer1(result.player1);
      setPlayer2(result.player2);
    }
    else {
      window.alert(result.msg);
    }
  }

  async function updateGameInfo(data) {
    const res = await fetch(`${API_URL}/games/update`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`
      }
    });
    const result = await res.json();
    console.log(result);
    if (res.status === 200) {
      // console.log(result.msg);
      setGame(result.game);
    }
    else {
      window.alert(result.msg);
    }
  }

  // authen when component mount
  useEffect(() => {
    async function Authen() {
      const status = await authen();
      if (status === 401) {
        History.push('/signin');
      }
    }
    Authen();
  }, []);

  // set game status (can start?) depends on 'youreReady' and 'opponentReady'
  useEffect(() => {
    setStart(player1Ready && player2Ready);
  }, [player1Ready, player2Ready]);

  // get game info when component mount
  useEffect(() => {
    if (game) { // if (game === {})
      console.log("Game setup");
      getGame(gameID);
    }
  }, []);

  // get player info when component mount
  useEffect(() => {
    if (!game.Result) { // if (game.Result == null)
      if (game.Player1ID === userID || game.Player2ID === userID) { // if (player === {})
        if (game.Player1ID === userID) {
          console.log("IM THE 1ST");
        }
        if (game.Player2ID === userID) {
          console.log("IM THE 2ND");
        }
        getPlayer(userID);
      }
    }
  }, [game]);

  // load moves
  useEffect(() => {
    socket.on(`load_moves_${gameID}`, data => {
      console.log("load_moves");
      setHistory(data.history);
      setStepNumber(data.history.length - 1);
      setXIsNext(player === "X");
      setIsYourTurn(data.isYourTurn);
    });
  }, [gameID, player]);

  // load chat
  useEffect(() => {
    socket.on(`load_chat_${gameID}`, data => {
      console.log("load_chat");
      setChatHistory(chatHistory.slice().concat(data.message));
    });
  }, [gameID, chatHistory]);

  //get notified when someone enter the room
  useEffect(() => {
    socket.on(`notify_gameID_${gameID}`, data => {
      console.log(`notify_gameID_${gameID}`);
      console.log(data);
      setChatHistory(chatHistory.slice().concat([
        {
          ownerID: null,
          message: (data.isMainPlayer ? data.player2.Name : data.observer.Name) + " has joined the game"
        }
      ]));

      setIsMainPlayer(data.isMainPlayer);

      if (data.isMainPlayer) {
        // player1 (who creates the game) moves first
        setIsYourTurn(userID === data.player1.ID ? true : false);
        setPlayer(userID === data.player1.ID ? "X" : "O");
        setPlayer2(userID === data.player1.ID ? data.player2 : data.player1);

      } else {
        if (data.userID === userID) {
          console.log("IM A VIEWER");
          console.log(data);
          setObserver(data.observer);
          if (data.player1.ID === game.Player1ID) {
            setPlayer1(data.player1);
            setPlayer2(data.player2);
          }
          else {
            setPlayer1(data.player2);
            setPlayer2(data.player1);
          }
        }
      }

    });
  }, [gameID, userID, chatHistory]);

  // player2 ready
  useEffect(() => {
    socket.on(`player2_ready_${gameID}`, data => {
      console.log("player2_ready");
      setPlayer2Ready(data.value);
    });
  }, [gameID]);

  // opponent leave
  // useEffect(() => {
  //   socket.on(`opponent_leave_game_${gameID}`, data => {
  //     console.log("opponent_leave_game");
  //     setUser(data.user);
  //   });
  // }, [gameID]);

  // owner of the game leaves game
  // useEffect(() => {
  //   socket.on(`owner_leave_game_${gameID}`, data => {
  //     console.log("owner_leave_game");
  //     console.log(data);
  //     setPlayer("X");
  //     setOpponentReady(false);
  //     setYoureReady(false);
  //     setOpponent({
  //       Name: "Waiting for opponent",
  //       Elo: 0
  //     });
  //     setGame(data.game);
  //   });
  // }, [gameID]);

  // time up
  useEffect(() => {
    socket.on(`timeup_${gameID}`, data => {
      console.log("time up");
      // reset player2
      setPlayer2(data.player2);
      // reset player1
      getPlayer(data.player1ID);

      const gameData = {
        game,
        player2ID: userID === game.Player1ID ? player2.ID : userID,
        result: data.winnerID === game.Player1ID ? 1 : 2,
        status: 0,
        moves: JSON.stringify(history),
        chatHistory: JSON.stringify(chatHistory)
      }
      if (!game.Result) {
        updateGameInfo(gameData);
      }

      setPlayer1Ready(false);
      setPlayer2Ready(false);
      setHasWinner(false);
    });
  }, [gameID, history, chatHistory, game]);

  const handleClick = (i) => {
    if (!isMainPlayer)// chỉ là khán giả thì ko click được
      return;

    const newHistory = history.slice(0, stepNumber + 1);
    const current = newHistory[newHistory.length - 1];
    const squares = current.squares.slice();

    if (hasWinner || squares[i] || !isYourTurn) {
      return;
    }

    squares[i] = xIsNext ? "X" : "O";
    setHistory(newHistory.concat([
      {
        squares: squares,
        position: i
      }
    ]));
    setStepNumber(newHistory.length);
    setXIsNext(!xIsNext);
    setIsYourTurn(!isYourTurn);

    //ok
    socket.emit("move", {
      history: history.concat([
        {
          squares: squares,
          position: i
        }
      ]),
      playerID: userID,
      gameID,
      isYourTurn
    });
  }

  const jumpTo = (step) => {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
  };

  const sortButtonClicked = () => {
    setIsAscending(!isAscending);
  };

  const current = history.slice(stepNumber, stepNumber + 1)[0];
  const winInfo = calculateWinner(current.squares, current.position, game.IsBlockedRule);
  const winner = winInfo.winner; // X or O

  // prevent from playing when there's a winner
  useEffect(() => {
    setHasWinner(winner !== null);
  }, [winner]);

  useEffect(() => {
    if (isMainPlayer && hasWinner) {
      const elo = calculateElo(player1.Elo, player2.Elo);
      const win = player === winner;
      const msg = (win ? "You win\n+" : "You lose\n-") + elo + " elo";
      const data = {
        player1,
        win: win,
        elo: elo,
        player2ID: player2.ID
      }
      updatePlayersInfo(data);

      // some code to update game result here
      const gameData = {
        game,
        player2ID: userID === game.Player1ID ? player2.ID : userID,
        result: (win && userID === game.Player1ID) || (!win && userID === game.Player2ID) ? 1 : 2,
        status: 0,
        moves: JSON.stringify(history),
        chatHistory: JSON.stringify(chatHistory)
      }
      if (!game.Result) {
        updateGameInfo(gameData);
      }

      // emit tới server để xóa game này khỏi game layout của những người chơi khác

      alert(msg);
      setPlayer2Ready(false);
      setPlayer1Ready(false);
      setHasWinner(false);
    }
  }, [winner, hasWinner, isMainPlayer, history, chatHistory, game]);

  const moves = history.map((step, move) => {
    const boardSize = config.boardSize;
    const rowIndex = Math.floor(step.position / boardSize);
    const colIndex = step.position % boardSize;
    const desc = move ? 'Go to move #' + move +
      ' (' + colIndex + ', ' + rowIndex + ')' : 'Go to game start';
    const buttonClassName = (move === stepNumber) ? "selected-move" : "";
    return (
      <li key={move}>
        <button className={buttonClassName} onClick={() => jumpTo(move)}>{desc}</button>
      </li>
    );
  });

  if (!isAscending) {
    moves.reverse();
  }

  let status;
  if (winner) {
    status = "Winner: " + winner;
  }
  else {
    if (winInfo.isDraw) {
      status = "Draw!!!";
      window.alert("Draw!!!");
    }
    else {
      status = "Next player: " + (xIsNext ? "X" : "O");
    }
  }

  const handleChat = (e) => {
    e.preventDefault();
    setChatHistory(chatHistory => chatHistory.slice().concat([
      {
        ownerID: userID,
        message: chatItemMessage
      }
    ]));

    socket.emit("chat", {
      message: [
        {
          ownerID: userID,
          message: chatItemMessage
        }
      ],
      gameID
    });

    setChatItemMessage("");
  }

  const handleReady = () => {
    setPlayer1Ready(!player1Ready);
    socket.emit("ready", { gameID, value: !player1Ready });
  }

  // useEffect(() => {
  //   window.addEventListener('beforeunload', alertUser);
  //   window.addEventListener('unload', handleEndConcert);
  //   return () => {
  //     window.removeEventListener('beforeunload', alertUser);
  //     window.removeEventListener('unload', handleEndConcert);
  //     handleEndConcert(game, player2);
  //   }
  // }, [game, player2]);

  // const alertUser = e => {
  //   e.preventDefault();
  //   // e.returnValue = 'HAHA';
  //   window.alert('You are reload the page!!!');
  // }

  // const handleEndConcert = (game, player2) => {
  //   if (start) {
  //     const elo = calculateElo(user.Elo, player2.Elo);
  //     const win = !isYourTurn;
  //     const msg = (win ? "You win\n+" : "You lose\n-") + elo + " elo";
  //     //socket.emit("leave_game", { player1, player2, gameID, elo });
  //     window.alert(msg);
  //   }
  //   else {
  //     // leave game when the game is not starting yet
  //     // reset owner of the game if the owner leaves
  //     if (userID === game.Player1ID && player2.ID && !game.Result) {
  //       console.log("emit owner leave game");
  //       console.log(game);
  //       console.log(player2.ID);
  //       socket.emit("owner_leave_game", { game, userID, player2ID: player2.ID });
  //     }
  //   }
  // }

  const handleURLChangeWhenPlayingGame = () => {

    // if (('Are you sure you want to leave game')) {

    // }
  }

  const reyalp = player === "X" ? "O" : "X";
  let element = (
    <React.Fragment>
      <Prompt
        when={start}
        message={() => handleURLChangeWhenPlayingGame()}
      />
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', zIndex: '1', width: '100%' }}>
          <OnlineUsers onlineUserList={onlineUserList} />
        </div>
        <div className="game" style={{ paddingTop: '40px' }}>
          <div className="player-info">
            <CardHeader title="PLAYER INFO"></CardHeader>
            <Player player={player2} xOrO={reyalp} />

            {/* game not started */}
            {!start ?
              <Typography style={{ margin: "10px", color: "darkgreen" }}>
                {player2Ready ? 'Ready' : 'Not Ready'}
              </Typography> :
              <Timer
                socket={socket}
                gameID={gameID}
                value={game.TimeThinkingEachTurn}
                isYourTurn={!isYourTurn}
                player2={player2}
                player1={player1}
                isPlayer2={true}
                elo={calculateElo(player2.Elo, player1.Elo)}
              />}

            <br></br>
            <Player player={player1} xOrO={player} />

            {!start ?
              <>
                {/* game not started */}
                {
                  isMainPlayer ?
                    // là người chơi chính thì hiện nút để ready or cancel
                    (player2.ID ?
                      <Button style={{ margin: "10px" }} variant="contained" color="primary"
                        onClick={handleReady}
                      >
                        {player1Ready ? "Cancel" : "Ready"}
                      </Button>
                      :
                      <React.Fragment></React.Fragment>
                    )
                    :
                    <Typography style={{ margin: "10px", color: "darkgreen" }}>
                      {player1Ready ? 'Ready' : 'Not Ready'}
                    </Typography>
                }
              </>
              // waiting for opponent, hide the Ready Button
              :
              <Timer
                socket={socket}
                gameID={gameID}
                value={game.TimeThinkingEachTurn}
                isYourTurn={isYourTurn}
                player2={player1}
                player1={player2}
                isPlayer2={false}
                elo={calculateElo(player2.Elo, player1.Elo)}
              />
            }
          </div>

          <div className="game-board">
            <CardHeader title={"GAME " + game.Name}></CardHeader>
            <CardHeader title={"GAME " + game.ID}></CardHeader>
            {start ?
              <Board
                key={stepNumber}
                squares={current.squares}
                onClick={i => handleClick(i)}
                winLine={winInfo.winLine}
              /> : <React.Fragment></React.Fragment>}
          </div>
          <div className="game-info">
            <CardHeader title="GAME INFO"></CardHeader>
            {game.IsBlockedRule ? <Typography>Blocked Rule</Typography> : <React.Fragment></React.Fragment>}
            {start ?
              <React.Fragment>
                <div>{status}</div>
                <div>
                  <button onClick={() => sortButtonClicked()}>
                    {isAscending ? "Descending" : "Ascending"}
                  </button>
                </div>
                <ol style={{ maxHeight: '275px', overflowY: 'scroll' }}>{moves}</ol>
              </React.Fragment> :
              <React.Fragment></React.Fragment>}
            <div className="chat-box">
              <CardHeader title="CHAT BOX"></CardHeader>
              <Card style={{ width: '100%', minHeight: '100px', maxHeight: '175px', overflowY: 'scroll' }}>
                {chatHistory.map((item, i) => {
                  return (
                    <div key={i} className="chat-item"
                      style={{
                        color: item.ownerID === null ? 'gray' :
                          (item.ownerID === userID ? 'orange' : 'green')
                      }}
                    >
                      {item.ownerID === null ? item.message :
                        ((item.ownerID === game.Player1ID ? player1.Name :
                          (item.ownerID === game.Player2ID ? player2.Name : observer.Name)) + ": " + item.message)}
                    </div>
                  );
                })}
              </Card>
              <form className="form" onSubmit={handleChat}>
                <TextField id="message" name="message" label="Message" variant="outlined" size="small"
                  margin="normal" required fullWidth autoFocus value={chatItemMessage}
                  onChange={e => setChatItemMessage(e.target.value)}
                />
                <IconButton className="submit-button" size="small" type="submit" color="primary">
                  <SendMessageIcon />
                </IconButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );

  return (
    element
  );
}

export default Game;