import React, { useState, useEffect } from 'react';

function Timer({ socket, gameID, value, isYourTurn, player2, player1, isPlayer2, elo }) {
  const [seconds, setSeconds] = useState(value);

  useEffect(() => {
    let myInterval = setInterval(() => {
      // count down if it's your turn
      if (seconds > 0 && isYourTurn) {
        setSeconds(seconds - 1);
      }
      // reset timer when it's your opponent's turn
      if (!isYourTurn) {
        setSeconds(value);
      }

      // check when player runs out of time (you lose)
      // isPlayer2 means the opponent's timer counts down
      if (seconds === 0) {
        console.log("Game over");
        clearInterval(myInterval);
        const msg = "You " + (isPlayer2 ? "win\n+" : "lose\n-") + elo + " elo";
        window.alert(msg);
        socket.emit("run_out_of_time",
          {
            gameID,
            player: isPlayer2 ? player1 : player2,
            win: isPlayer2,
            elo,
            player2ID: !isPlayer2 ? player1.ID : player2.ID
          });
      }
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  }, [seconds, isYourTurn]);

  return (
    <div>
      Time: {seconds}
    </div>
  );
}

export default Timer;