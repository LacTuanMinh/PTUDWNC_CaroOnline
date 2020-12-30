import React, { useState, useEffect } from 'react';
import config from '../../constants/config.json';

const API_URL = config.API_URL_TEST;

function Timer({ setHasWinner, winner, game, value, isYourTurn, player1, player2, setPlayer1, setPlayer2, setGame, isPlayer2, elo, isMainPlayer, history, chatHistory }) {
  const userID = localStorage.getItem("userID");
  const jwtToken = localStorage.getItem("jwtToken");
  const [seconds, setSeconds] = useState(value);

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

  useEffect(() => {
    let myInterval = setInterval(() => {
      // count down if it's your turn
      if (seconds > 0) {
        if (isYourTurn) {
          setSeconds(seconds - 1);
        }
      }
      // reset timer when it's your opponent's turn (you finished your turn)
      if (!isYourTurn) {
        setSeconds(value);
      }

      // check when player runs out of time (you lose)
      // isPlayer2 means the opponent's timer counts down
      if (seconds === 0) {
        console.log("Game over");
        setHasWinner(true);

        if (isMainPlayer) {
          clearInterval(myInterval);
          const msg = "You " + (isPlayer2 ? "win\n+" : "lose\n-") + elo + " elo";
          window.alert(msg);

          // cập nhatt65 elo cũa t/m
          const data = {
            player1: isPlayer2 ? player1 : player2,
            win: isPlayer2,
            elo,
            player2ID: !isPlayer2 ? player1.ID : player2.ID,

          }
          console.log(data);
          updatePlayersInfo(data);
          setPlayer2({ ...player2, Elo: data.elo });

          if (userID === game.Player1ID) {
            const gameData = {
              game,
              player2ID: !isPlayer2 ? player1.ID : player2.ID,//userID === game.Player1ID ? player2.ID : userID,
              result: winner === 'X' ? 1 : 2,
              status: 0,
              moves: JSON.stringify(history),
              chatHistory: JSON.stringify(chatHistory)
            }
            console.log(gameData);
            updateGameInfo(gameData);
          }
          // cập nhat65 result game
          // socket.emit("run_out_of_time",
          //   {
          //     game,
          //     player: isPlayer2 ? player1 : player2,
          //     win: isPlayer2,
          //     elo,
          //     player2ID: !isPlayer2 ? player1.ID : player2.ID
          //   }
          // );
        }
      }
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  }, [seconds, isYourTurn, isMainPlayer]);


  return (
    <div style={{ margin: '10px' }}>
      Time: {seconds}
    </div>
  );
}

export default Timer;