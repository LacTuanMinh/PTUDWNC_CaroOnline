import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Board from '../Game/board';
import CardHeader from '@material-ui/core/CardHeader';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { authen } from '../../utils/helper';
import defaultAvatar from '../../images/defaultAvatar.jpg';
import { calculateWinner } from '../Game/gameServices';
import config from '../../constants/config.json';

const API_URL = config.API_URL_TEST;

export default function PlayedGame() {
  const History = useHistory();
  const userID = localStorage.getItem('userID');
  const gameID = useParams().id;
  const token = localStorage.getItem('jwtToken');

  const [game, setGame] = useState({});
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [history, setHistory] = useState([
    {
      squares: Array(0).fill(null),
      position: -1
    }
  ]);
  const [player, setPlayer] = useState("X");// X || O
  const [chatHistory, setChatHistory] = useState([]);
  const [avatar1, setAvatar1] = useState("");
  const [avatar2, setAvatar2] = useState("");

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
    async function retrieveAvatar(ID) {
      const res = await fetch(`${API_URL}/users/avatar/${ID}`, {
        method: 'GET',
        headers: {
          ContentType: 'image/jpeg',
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 200) {
        const result = await res.blob();
        return (URL.createObjectURL(result));
      } else return "";
    }
    async function retrieveGameData() {
      const res = await fetch(`${API_URL}/games/playedGameDetail/${gameID}`, {
        method: 'GET',
        headers: {
          'Content-Type': "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.status === 200) {
        const result = await res.json();
        const game = result.game;
        setGame(game);
        const moves = JSON.parse(game.Moves);
        setHistory(moves);
        setChatHistory(JSON.parse(game.ChatHistory));
        setStepNumber(moves.length - 1);
        setPlayer1Name(result.player1Name);
        setPlayer2Name(result.player2Name);
        setAvatar1(await retrieveAvatar(game.Player1ID));
        setAvatar2(await retrieveAvatar(game.Player2ID));
      }
    }

    retrieveGameData();
  }, [setGame, setHistory, setChatHistory, setAvatar1, setAvatar2]);

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

  const opponent = player === "X" ? "O" : "X";

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

  const handleClick = (i) => { return; }

  return (
    <>
      <div style={{ position: 'relative' }}>

        <div className="game" style={{ marginTop: '25px' }}>
          <div className="player-info">
            <CardHeader title="Player Info"></CardHeader>
            <div style={{ border: `3px solid blue` }}>
              <img src={avatar1 ? avatar1 : defaultAvatar}
                style={{ height: '150px', width: '200px' }}
              />
              <Typography>Name: {player1Name} {game.Player1ID === userID ? " (You)" : null}</Typography>
            </div>
            <br></br>

            <div style={{ border: `3px solid red` }}>
              <img src={avatar2 ? avatar2 : defaultAvatar}
                style={{ height: '150px', width: '200px' }}
              />
              <Typography>Name: {player2Name} {game.Player2ID === userID ? " (You)" : null}</Typography>
            </div>
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
            <div className="paper-like-shadow" style={{
              marginTop: '20px',
              marginLeft: '20px',
              minWidth: '320px',
            }}
            >
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel2a-content"
                  id="panel2a-header"
                >
                  <Typography><b>Chat Messages</b></Typography>
                </AccordionSummary>
                <AccordionDetails style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', padding: '20px' }}>
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
                </AccordionDetails>
              </Accordion>
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

            </div>
          </div>
        </div>
      </div>
    </>

  );
}