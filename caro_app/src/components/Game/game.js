import React, {useState, useEffect} from 'react';
import { useHistory } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import SendMessageIcon from '@material-ui/icons/Send';
import Typography from '@material-ui/core/Typography';
import CardMedia from '@material-ui/core/CardMedia';

import Board from './board';
import Player from '../Player/player';
import defaultAvatar from '../../images/defaultAvatar.jpg';
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
  const [user, setUser] = useState({});
  const [opponent, setOpponent] = useState({});
  const [isYourTurn, setIsYourTurn] = useState(true);
  const History = useHistory();

  useEffect(() => {
    async function Authen() {
      const status = await authen();
      if (status === 401) {
        History.push('/signin');
      }
    }
    Authen();
  }, []);

  useEffect(() => {
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
      setUser(result.user);
    }
    if (user) {
      getPlayer(userID);
    }
  }, []);
  
  useEffect(() => {
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
    if (game) {
      getGame(gameID);
    }
  }, []);
  
  useEffect(() => {
    socket.on(`load_moves_${gameID}`, data => {
      //if (data.playerID !== userID) {
        console.log("load_moves");
        setHistory(data.history);
        setStepNumber(data.history.length - 1);
        setXIsNext(!xIsNext);
        setIsYourTurn(!isYourTurn);
      //}
    });
  }, [xIsNext, isYourTurn, gameID]);

  useEffect(() => {
    socket.on(`load_chat_${gameID}`, data => {
      //if (data.playerID !== userID) {
        console.log("load_chat");
        setChatHistory(chatHistory.concat(data.message));
      //}
    });
  }, [gameID, chatHistory]);

  useEffect(() => {
    socket.on(`notify_gameID_${gameID}`, async data => {
      console.log(`notify_gameID_${gameID}`);
      console.log(data);
      setChatHistory(chatHistory.concat([
        {
          ownerID: null,
          message: data.player2.Name + " has joined the game"
        }
      ]));
      // player1 (who creates the game) moves first
      setIsYourTurn(userID === data.player1.ID ? true : false);
      setOpponent(userID === data.player1.ID ? data.player2 : data.player1);
    });
  }, [chatHistory, gameID]);

  const handleClick = (i) => {
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

    socket.emit("move", { 
      history: history.concat([
        {
          squares: squares,
          position: i
        }
      ]),
      playerID: userID,
      gameID
    });
  }

  const jumpTo = (step) => {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
  };

  const sortButtonClicked = () => {
    setIsAscending(!isAscending);
  };

  const current = history[stepNumber];
  const winInfo = calculateWinner(current.squares, current.position, game.IsBlockedRule);
  const winner = winInfo.winner; // X or O

  // prevent from playing when there's a winner
  useEffect(() => {
    setHasWinner(winner != null);
  }, [winner]);

  useEffect(() => {
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
        setUser(result.player);
      } else {
        window.alert(result.msg);
      }
    }

    if (hasWinner) {
      const elo = calculateElo(user.Elo, opponent.Elo);
      const win = !isYourTurn;
      const msg = (win ? "You win\n+" : "You lost\n-") + elo + " elo";
      const data = {
        player: user,
        win: win,
        elo: elo
      }
      updatePlayersInfo(data);
      console.log("HAHA");
      window.alert(msg);
    }
  }, [hasWinner, isYourTurn]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setChatHistory(chatHistory.concat([
      {
        ownerID: user.ID,
        message: chatItemMessage
      }
    ]));

    socket.emit("chat", { 
      message: [
        {
          ownerID: user.ID,
          message: chatItemMessage
        }
      ],
      gameID
    });

    setChatItemMessage("");
  }

  let element = (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', zIndex: '1', width: '100%' }}>
        <OnlineUsers onlineUserList={onlineUserList} />
      </div>
      <div className="game" style={{ paddingTop: '40px' }}>
        <div className="player-info">
          <div style={{ border: '3px solid red' }}>
            <CardHeader title="OPPONENT"></CardHeader>
            <CardMedia image={opponent.Avatar == null ? defaultAvatar : opponent.Avatar}
              style={{ height: '200px', width: '200px' }}
            >
            </CardMedia>
            <Player
              player={opponent}
            >
            </Player>
          </div>
          <br></br>
          <div style={{ border: '3px solid blue' }}>
            <CardHeader title="YOU"></CardHeader>
            <CardMedia image={user.Avatar == null ? defaultAvatar : user.Avatar}
              style={{ height: '200px', width: '200px' }}
            >
            </CardMedia>
            <Player
              player={user}
            >
            </Player>
          </div>
        </div>
        <div className="game-board">
          <CardHeader title={"GAME " + game.Name}></CardHeader>
          <Board
            key={stepNumber}
            squares={current.squares}
            onClick={i => handleClick(i)}
            winLine={winInfo.winLine}
          />
        </div>
        <div className="game-info">
          <CardHeader title="GAME INFO"></CardHeader>
          {game.IsBlockedRule ? <Typography>Blocked Rule</Typography> : <React.Fragment></React.Fragment>}
          <div>{status}</div>
          <div>
            <button onClick={() => sortButtonClicked()}>
              {isAscending ? "Descending" : "Ascending"}
            </button>
          </div>
          <ol style={{ maxHeight: '275px', overflowY: 'scroll' }}>{moves}</ol>
          <div className="chat-box">
            <CardHeader title="CHAT BOX"></CardHeader>
            <Card style={{ width: '100%', minHeight: '100px', maxHeight: '175px', overflowY: 'scroll' }}>
              {chatHistory.map((item, i) => {
                return (
                  <div key={i} className="chat-item"
                    style={{ color: item.ownerID === null ? 'gray' : 
                      (item.ownerID === userID ? 'orange' : 'green') }}
                  >
                    {item.ownerID === null ? item.message : 
                      ((item.ownerID === userID ? user.Name : opponent.Name) + ": " + item.message)}
                  </div>
                );
              })}
            </Card>
            <form className="form" onSubmit={handleSubmit}>
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
  );

  return (
    element    
  );  
}

export default Game;