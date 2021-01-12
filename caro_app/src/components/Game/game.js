import React, { useState, useEffect } from 'react';
import { Prompt } from 'react-router';
import { useHistory } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import SendMessageIcon from '@material-ui/icons/Send';
import Button from '@material-ui/core/Button';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';

import Board from './board';
import Player from '../Player/player';
import Timer from '../Timer/timer';
import { calculateWinner, calculateElo } from './gameServices';
import OnlineUsers from '../OnlineUsers/onlineUsers_Secondary';
import { authen } from '../../utils/helper';
import config from '../../constants/config.json';
import { InformationSnackbar } from '../SnackBar/snackbar';
const API_URL = config.API_URL_TEST;

function Game({ socket, onlineUserList }) {
  const pathTokensArray = window.location.toString().split('/');
  const gameID = pathTokensArray[pathTokensArray.length - 1];
  const name = localStorage.getItem('name');
  const userID = localStorage.getItem('userID');
  const jwtToken = window.localStorage.getItem('jwtToken');
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
  const [observers, setObservers] = useState([]);
  const [isMainPlayer, setIsMainPlayer] = useState(false);
  const [isYourTurn, setIsYourTurn] = useState(true);
  const [player, setPlayer] = useState("X");// X || O
  const [player1Ready, setPlayer1Ready] = useState(false);
  const [player2Ready, setPlayer2Ready] = useState(false);
  const [counter, setCounter] = useState(null);
  const [content, setContent] = useState("");
  const [showSnackbar, setShowSnackBar] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");

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
  // async function updatePlayersInfo(data) {
  //   const res = await fetch(`${API_URL}/users/update`, {
  //     method: 'POST',
  //     body: JSON.stringify(data),
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${jwtToken}`
  //     }
  //   });
  //   const result = await res.json();
  //   console.log(result);
  //   if (res.status === 200) {
  //     console.log(result.msg);
  //     setPlayer1(result.player1);
  //     setPlayer2(result.player2);
  //   }
  //   else {
  //     window.alert(result.msg);
  //   }
  // }

  // async function updateGameInfo(data) {
  //   const res = await fetch(`${API_URL}/games/update`, {
  //     method: 'POST',
  //     body: JSON.stringify(data),
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${jwtToken}`
  //     }
  //   });
  //   const result = await res.json();
  //   console.log(result);
  //   if (res.status === 200) {
  //     // console.log(result.msg);
  //     setGame(result.game);
  //   }
  //   else {
  //     window.alert(result.msg);
  //   }
  // }

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

  // set game status (can start?) depends on 'youreReady' and 'opponentReady'
  useEffect(() => {
    if (player1Ready && player2Ready && isMainPlayer) {
      socket.emit("game_started", {
        gameID,
        elo: calculateElo(player1.Elo, player2.Elo)
      });
    }
  }, [player1Ready, player2Ready, isMainPlayer]);

  useEffect(() => {
    console.log('game really stared');
    socket.on(`game_started_${gameID}`, (data) => {
      setStart(true);
      setCounter(data.counter);
      // if (userID === data.player1ID) {
      //   setContent("It's your turn");
      //   setShowSnackBar(true);
      // }
    });
  }, [gameID]);

  // load moves
  useEffect(() => {
    socket.on(`load_moves_${gameID}`, data => {
      console.log("load_moves");
      setHistory(data.history);
      setStepNumber(data.history.length - 1);
      setXIsNext(data.player === "X");
      setCounter(data.counter);
      setIsYourTurn(data.isYourTurn);
      if (isMainPlayer) {
        setContent("It's your turn");
        setShowSnackBar(true);
      }
    });
  }, [gameID, userID, isMainPlayer]);

  // load chat
  useEffect(() => {
    socket.on(`load_chat_${gameID}`, data => {
      console.log("load_chat");
      setChatHistory(chatHistory => [...chatHistory, data.message]);
    });
  }, [gameID]);

  //get notified when someone enter the room
  useEffect(() => {
    socket.on(`notify_join_game_${gameID}`, data => {
      console.log(`notify_join_game_${gameID}`);
      console.log(data);

      setObservers(data.observers);

      if (data.isMainPlayer) {
        // player1 (who creates the game) moves first
        setIsYourTurn(userID === data.player1.ID ? true : false);
        setPlayer(userID === data.player1.ID ? "X" : "O");
        if (userID === data.player1.ID) {
          setPlayer1(data.player1);
          setPlayer2(data.player2);
        } else {
          setPlayer1(data.player2);
          setPlayer2(data.player1);
        }
        setIsMainPlayer(data.isMainPlayer);// default is false, now set to true
        setChatHistory(data.chatHistory);
      } else { // is not main players
        console.log("IM A VIEWER");
        setChatHistory(data.chatHistory);

        if (userID !== data.player1.ID && userID !== data.player2.ID) {
          // chặn 2 màn hình người choi8 chính cập nhật màn hình khi khán giả vào phòng
          if (data.player1.ID === data.game.Player1ID && data.player2.ID === data.game.Player2ID) {
            setPlayer1(data.player1);
            setPlayer2(data.player2);
          }
          else {
            setPlayer1(data.player2);
            setPlayer2(data.player1);
          }
          setPlayer1Ready(data.player1Ready);
          setPlayer2Ready(data.player2Ready);

          if (data.game.Status === 2) {
            console.log(data.moves);
            setHistory(data.moves);
            setIsYourTurn(data.isXTurn);
            setCounter(data.counter);
          }
        }
      }
    });
  }, [gameID, userID]);

  // player 2 & observer get info from player1 (owner)
  useEffect(() => {
    socket.on(`I_need_game_info_${gameID}_${userID}`, (data) => {
      socket.emit(`I_provide_game_info`, {
        gameID,
        userID: data.userID,
        chatHistory: chatHistory,
        moves: history,
        player1Ready,
        player2Ready,
      });
    });
  }, [gameID, userID, chatHistory, history]);

  // for observer to get game info
  useEffect(() => {
    socket.on(`receive_your_data_${gameID}_${userID}`, data => {
      setChatHistory(data.chatHistory);
      setHistory(data.moves);
    });
  }, [gameID, userID]);

  //player ready
  useEffect(() => {
    socket.on(`ready_${gameID}`, data => {
      if (data.player2.ID === userID) {
        console.log("player2 ready");
        setPlayer2Ready(data.player1.player1Ready);
      }
      else {
        if (data.player1.ID === data.game.Player1ID) {
          console.log("player1 ready");
          setPlayer1Ready(data.player1.player1Ready);
        }
        else {
          console.log("player2 ready");
          setPlayer2Ready(data.player1.player1Ready);
        }
      }
      // setPlayer2Ready(data.value);
    });
  }, [userID, gameID]);

  // time up
  useEffect(() => {
    socket.on(`time_up_${gameID}`, data => {
      console.log("time up", data);

      if (userID === data.player1.ID) {
        setPlayer1(data.player1);
        setPlayer2(data.player2);
      }
      else {
        setPlayer1(data.player2);
        setPlayer2(data.player1);
      }

      if (data.winner === 'X') {
        let message = `${data.player1.Name} has won ${data.elo} Elo\n. ${data.player2.Name} has lost ${data.elo} Elo`;
        setContent(message);
        setShowSnackBar(true);
      } else {
        let message = `${data.player2.Name} has won ${data.elo} Elo\n${data.player1.Name} has lost ${data.elo} Elo`;
        setContent(message);
        setShowSnackBar(true);
      }

      setHasWinner(true);
      setPlayer1Ready(false);
      setPlayer2Ready(false);
    });
  }, [gameID, userID]);

  useEffect(() => {
    socket.on(`game_over_${gameID}`, data => {
      if (userID === data.player1.ID) {
        setPlayer1(data.player1);
        setPlayer2(data.player2);
      }
      else {
        setPlayer1(data.player2);
        setPlayer2(data.player1);
      }

      if (data.winner === 'X') {
        let message = `${data.player1.Name} has won ${data.elo} Elo\n. ${data.player2.Name} has lost ${data.elo} Elo`;
        setContent(message);
        setShowSnackBar(true);
      } else if (data.winner === 'O') {
        let message = `${data.player2.Name} has won ${data.elo} Elo\n. ${data.player1.Name} has lost ${data.elo} Elo`;
        setContent(message);
        setShowSnackBar(true);
      } else {
        // draw
        let message = `Draw!!! ${data.player1.Name} and ${data.player2.Name} got +1 Elo`;
        setContent(message);
        setShowSnackBar(true);
      }

      setHasWinner(true);
      setPlayer1Ready(false);
      setPlayer2Ready(false);
      setStart(false);
      setCounter(0);
    })
  }, []);

  const handleClick = (i) => {
    if (!isMainPlayer)// chỉ là khán giả thì ko click được
      return;

    if (!start)
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
    setCounter(game.TimeThinkingEachTurn);
    //ok
    socket.emit("move", {
      history: history.concat([
        {
          squares: squares,
          position: i
        }
      ]),//
      isXTurn: !xIsNext,//
      player: xIsNext ? "O" : "X",
      playerID: userID,
      opponentID: player2.ID,
      gameID,
      isBlockedRule: game.isBlockedRule,
      // game,
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

  // useEffect(() => {

  //   if (hasWinner) {
  //     setPlayer2Ready(false);
  //     setPlayer1Ready(false);
  //   }

  //   if (isMainPlayer && hasWinner) {
  //     // if (!game.Result) {
  //     //   const elo = calculateElo(player1.Elo, player2.Elo);
  //     //   const win = player === winner;
  //     //   const msg = (win ? "You win\n+" : "You lose\n-") + elo + " elo";
  //     //   const data = {
  //     //     player1,
  //     //     win: win,
  //     //     elo: elo,
  //     //     player2ID: player2.ID
  //     //   }
  //     //   updatePlayersInfo(data);

  //     //   const gameData = {
  //     //     game,
  //     //     player2ID: userID === game.Player1ID ? player2.ID : userID,
  //     //     result: (win && userID === game.Player1ID) || (!win && userID === game.Player2ID) ? 1 : 2,
  //     //     status: 0,
  //     //     moves: JSON.stringify(history),
  //     //     chatHistory: JSON.stringify(chatHistory)
  //     //   }
  //     //   updateGameInfo(gameData);

  //     //   alert(msg);
  //     // }

  //     // emit to update players info for observers


  //     // emit tới server để xóa game này khỏi game layout của những người chơi khác


  //     // setStart(false);
  //     // setHasWinner(false);
  //   }
  // }, [winner, isMainPlayer, history, chatHistory, game]);

  const moves = history.map((step, move) => {
    const boardSize = config.boardSize;
    const rowIndex = Math.floor(step.position / boardSize);
    const colIndex = step.position % boardSize;
    const desc = move ? 'Go to move #' + move +
      ' (' + colIndex + ', ' + rowIndex + ')' : 'Go to game start';
    const buttonClassName = (move === stepNumber) ? "selected-move" : "";
    return (
      <li key={move}>
        <button className={buttonClassName} disabled onClick={() => jumpTo(move)}>{desc}</button>
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
        message: name + ': ' + chatItemMessage
      }
    ]));

    socket.emit("chat", {
      message: {
        ownerID: userID,
        message: name + ': ' + chatItemMessage
      },
      gameID
    });
    setChatItemMessage("");
  }

  const handleReady = () => {
    setPlayer1Ready(!player1Ready);
    socket.emit("ready", {
      gameID,
      userID,
      game,
      player1: { ID: player1.ID, player1Ready: !player1Ready },
      player2: { ID: player2.ID, player2Ready: player2Ready }
    });
  }

  const handleDrawRequest = () => {
    setContent("Your request has been sent, please wait for respond");
    setShowSnackBar(true);
    socket.emit("draw_request", { gameID, to: player2.ID });
  }

  const handleSurrenderRequest = () => {
    setContent("Your request has been sent, please wait for respond");
    setShowSnackBar(true);
    socket.emit("surrender_request", { gameID, to: player2.ID });
  }

  useEffect(() => {
    socket.on(`received_draw_request_${gameID}`, data => {
      if (data.to === userID) {
        setDialogTitle(player2.Name + " want a draw");
        setRequestDialogOpen(true);
      }
    });
  }, [gameID, player2.Name]);

  useEffect(() => {
    socket.on(`received_surrender_request_${gameID}`, data => {
      if (data.to === userID) {
        setDialogTitle(player2.Name + " want to surrender");
        setRequestDialogOpen(true);
      }
    });
  }, [gameID, player2.Name]);

  const handleCloseRequest = () => {
    setRequestDialogOpen(false);
    socket.emit("deny_request", { gameID, to: player2.ID });
  }

  const handleAcceptRequest = () => {
    const tokens = dialogTitle.split(' ');
    socket.emit("accept_request", {
      gameID,
      to: player2.ID,
      elo: calculateElo(player1.Elo, player2.Elo),
      drawOrSurrender: tokens[tokens.length - 1]
    });
    setRequestDialogOpen(false);
  }

  useEffect(() => {
    socket.on(`request_denied_${gameID}`, data => {
      if (data.to === userID) {
        setContent("Your request has been denied");
        setShowSnackBar(true);
      }
    });
  }, [gameID]);


  /*opponent leave
    useEffect(() => {
      socket.on(`opponent_leave_game_${gameID}`, data => {
        console.log("opponent_leave_game");
        setUser(data.user);
      });
    }, [gameID]);
  
    owner of the game leaves game
    useEffect(() => {
      socket.on(`owner_leave_game_${gameID}`, data => {
        console.log("owner_leave_game");
        console.log(data);
        setPlayer("X");
        setOpponentReady(false);
        setYoureReady(false);
        setOpponent({
          Name: "Waiting for opponent",
          Elo: 0
        });
        setGame(data.game);
      });
    }, [gameID]);*/
  // useEffect(() => {
  //   window.addEventListener('beforeunload', alertUser);
  //   window.addEventListener('unload', handleEndConcert);
  //   return () => {
  //     window.removeEventListener('beforeunload', alertUser);
  //     window.removeEventListener('unload', handleEndConcert);
  //     handleEndConcert(game, player2);
  //   }
  // }, [game, player2]);

  const alertUser = e => {
    e.preventDefault();
    e.returnValue = 'HAHA';
    window.alert('You are reload the page!!!');
  }

  const handleEndConcert = (game, player2) => {
    // if (start) {
    //   const elo = calculateElo(user.Elo, player2.Elo);
    //   const win = !isYourTurn;
    //   const msg = (win ? "You win\n+" : "You lose\n-") + elo + " elo";
    //   //socket.emit("leave_game", { player1, player2, gameID, elo });
    //   window.alert(msg);
    // }
    // else {
    //   // leave game when the game is not starting yet
    //   // reset owner of the game if the owner leaves
    //   if (userID === game.Player1ID && player2.ID && !game.Result) {
    //     console.log("emit owner leave game");
    //     console.log(game);
    //     console.log(player2.ID);
    //     socket.emit("owner_leave_game", { game, userID, player2ID: player2.ID });
    //   }
    // }
  }

  const handleURLChangeWhenPlayingGame = () => {
    // var r = window.confirm("Press a button!");
    // if (r == true) {
    //   console.log("ok ");
    // } else {
    //   console.log("cancel");;
    // }
  }

  const opponent = player === "X" ? "O" : "X";
  const element = (
    <React.Fragment>
      {/* <Prompt
        when={true}
        message={() => handleURLChangeWhenPlayingGame()}
      /> */}
      <InformationSnackbar open={showSnackbar} setOpen={(isOpen) => setShowSnackBar(isOpen)} content={content} />

      <Dialog open={requestDialogOpen} onClose={handleCloseRequest} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{dialogTitle}</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseRequest} color="primary">
            Deny
          </Button>
          <Button onClick={handleAcceptRequest} color="primary">
            Accept
          </Button>
        </DialogActions>
      </Dialog>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', zIndex: '1', width: '100%' }}>
          <OnlineUsers socket={socket} gameID={gameID} onlineUserList={onlineUserList} observers={observers} />
        </div>
        <div className="game" style={{ marginTop: '25px' }}>
          <div className="player-info">
            <CardHeader title="Player Info"></CardHeader>
            <Player player={player2} xOrO={opponent} />
            {/* game not started and game result is null*/}
            {start || hasWinner ? <React.Fragment></React.Fragment> :
              <Typography style={{ margin: "10px", color: "darkgreen" }}>
                {player2Ready ? 'Ready' : 'Not Ready'}
              </Typography>
            }
            <br></br>
            <Timer
              counter={counter}
              setCounter={setCounter}
              start={start}
            />
            {start && isMainPlayer ?
              <div style={{ display: 'flex' }}>
                <Button color="primary" variant="contained" style={{ marginRight: '5px' }}
                  onClick={handleDrawRequest}
                >
                  Draw
                </Button>
                <Button color="primary" variant="contained" onClick={handleSurrenderRequest}>
                  Surrrender
                </Button>
              </div> :
              <React.Fragment></React.Fragment>
            }
            <br></br>

            <Player player={player1} xOrO={player} />

            {start || hasWinner ? <React.Fragment></React.Fragment> :
              (isMainPlayer && player1.ID ?
                // là người chơi chính thì hiện nút để ready or cancel
                (player2.ID ?
                  <Button style={{ margin: "10px" }} variant="contained" color="primary"
                    onClick={handleReady}
                  >
                    {player1Ready ? "Cancel" : "Ready"}
                  </Button> : <React.Fragment></React.Fragment>
                ) :
                <Typography style={{ margin: "10px", color: "darkgreen" }}>
                  {player1Ready ? 'Ready' : 'Not Ready'}
                </Typography>
              )
            }
          </div>

          <div className="game-board">
            <CardHeader style={{ padding: '5px' }} title={"Game name: " + game.Name}></CardHeader>
            <CardHeader style={{ padding: '5px' }} title={"Game ID: " + game.ID}></CardHeader>
            <Board
              key={stepNumber}
              squares={current.squares}
              onClick={i => handleClick(i)}
              winLine={winInfo.winLine}
            />
          </div>
          <div className="game-info">

            <div className="chat-box" >
              <CardHeader title="Chat Box"></CardHeader>
              <Card style={{ boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)', width: '100%', minHeight: '200px', maxHeight: '200px', overflowY: 'scroll' }}>
                {chatHistory.map((item, i) => {
                  return (
                    <div key={i} className="chat-item"
                      style={{
                        color: item.ownerID === null ? 'gray' :
                          (item.ownerID === userID ? 'orange' : 'green')
                      }}
                    >
                      {item.message}
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

            <div className="paper-like-shadow" style={{
              marginTop: '20px',
              marginLeft: '20px',
              minWidth: '320px',
            }}
            >
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography><b>Gameplay Info</b></Typography>
                </AccordionSummary>
                <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
                  {game.IsBlockedRule ? <Typography>Blocked Rule</Typography> : <React.Fragment></React.Fragment>}

                  <div>{status}</div>
                  <div>
                    <button onClick={() => sortButtonClicked()}>
                      {isAscending ? "Descending" : "Ascending"}
                    </button>
                  </div>
                  <ol style={{ maxHeight: '200px', overflowY: 'scroll' }}>{moves}</ol>

                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel2a-content"
                  id="panel2a-header"
                >
                  <Typography><b>Observer List</b></Typography>
                </AccordionSummary>
                <AccordionDetails style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  {observers.map((observer, i) =>
                    <div key={i}>
                      <Typography>
                        {observer.Name}
                      </Typography>
                      <Divider />
                    </div>

                  )}
                </AccordionDetails>
              </Accordion>
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