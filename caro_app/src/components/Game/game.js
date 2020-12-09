import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import SendMessageIcon from '@material-ui/icons/Send';
import Board from './board';
import Player from '../Player/player';
import config from '../../constants/config.json';
import defaultAvatar from '../../images/defaultAvatar.jpg'
import calculateWinner from './gameServices';
import OnlineUsers from '../OnlineUsers/onlineUsers'
import { authen } from '../../utils/helper';

const chatMessages = [
  { owner: 'you', message: 'hello' },
  { owner: 'opponent', message: 'hi' },
  { owner: 'you', message: 'gl hf' },
  { owner: 'opponent', message: 'u2' },
  { owner: 'opponent', message: 'how are you?' },
  { owner: 'you', message: 'im good' },
  { owner: 'you', message: 'u?' },
  { owner: 'opponent', message: 'all good' }
];

const player = {
  id: 1,
  name: "Ho Khanh Nguyen"
}

const opponent = {
  id: 2,
  name: "My opponent"
}

function Game({ socket }) {
  const pathTokensArray = window.location.toString().split('/');
  const gameID = pathTokensArray[pathTokensArray.length - 1];
  const [hasWinner, setHasWinner] = useState(false);
  const [chatHistory, setChatHistory] = useState(chatMessages);
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
  const History = useHistory();

  useEffect(() => {
    async function Authen() {
      const status = await authen();
      if (status === 401) {
        History.push('/signin')
      }
    }
    Authen();
  }, [History]);

  const handleClick = (i) => {
    const newHistory = history.slice(0, stepNumber + 1);
    const current = newHistory[newHistory.length - 1];
    const squares = current.squares.slice();

    if (hasWinner || squares[i]) {
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
  };

  const jumpTo = (step) => {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
  };

  const sortButtonClicked = () => {
    setIsAscending(!isAscending);
  };

  const current = history[stepNumber];
  const winInfo = calculateWinner(current.squares, current.position);
  const winner = winInfo.winner;

  useEffect(() => {
    setHasWinner(winner != null);
  }, [winner]);

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
    }
    else {
      status = "Next player: " + (xIsNext ? "X" : "O");
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setChatHistory(chatHistory.concat([
      {
        owner: "you",
        message: chatItemMessage
      }
    ]));
  }

  let element = (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', zIndex: '1', width: '100%' }}>
        <OnlineUsers socket={socket} />
      </div>
      <div className="game" style={{ paddingTop: '40px' }}>
        <div className="player-info">
          <CardHeader title="OPPONENT"></CardHeader>
          <CardMedia image={defaultAvatar}
            style={{ height: '200px', width: '200px' }}
          >
          </CardMedia>
          <Player
            data={opponent}
          >
          </Player>
          <CardHeader title="YOU"></CardHeader>
          <CardMedia image={defaultAvatar}
            style={{ height: '200px', width: '200px' }}
          >
          </CardMedia>
          <Player
            data={player}
          >
          </Player>
        </div>
        <div className="game-board">
          <CardHeader title={"GAME " + gameID}></CardHeader>
          <Board
            key={stepNumber}
            squares={current.squares}
            onClick={i => handleClick(i)}
            winLine={winInfo.winLine}
          />
        </div>
        <div className="game-info">
          <CardHeader title="GAME INFO"></CardHeader>
          <div>{status}</div>
          <div>
            <button onClick={() => sortButtonClicked()}>
              {isAscending ? "Descending" : "Ascending"}
            </button>
          </div>
          <ol style={{ maxHeight: '275px', overflowY: 'scroll' }}>{moves}</ol>
          <div className="chat-box">
            <CardHeader title="CHAT BOX"></CardHeader>
            <Card style={{ width: '100%', maxHeight: '175px', overflowY: 'scroll' }}>
              {chatHistory.map((item, i) => {
                return (
                  <div key={i} className="chat-item" style={{ color: item.owner === "you" ? 'orange' : 'green' }}>
                    {item.owner + ": " + item.message}
                  </div>
                );
              })}
            </Card>
            <form className="form" onSubmit={handleSubmit}>
              <TextField id="message" name="message" label="Message" variant="outlined" size="small"
                margin="normal" required fullWidth autoFocus onChange={e => setChatItemMessage(e.target.value)}
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