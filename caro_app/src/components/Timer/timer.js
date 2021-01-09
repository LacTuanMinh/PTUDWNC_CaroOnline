import React, { useState, useEffect } from 'react';
import config from '../../constants/config.json';

const API_URL = config.API_URL_TEST;

function Timer({start, timeUpAt, timeThinkingEachTurn}) {
  const [seconds, setSeconds] = useState(timeThinkingEachTurn);

  useEffect(() => {
    let myInterval = setInterval(() => {
      if (start && seconds > 0) {
        setSeconds(seconds - 1);
      }
      else {
        setSeconds(timeThinkingEachTurn);
      }
    }, 1000);

    return () => {
      clearInterval(myInterval);
    };
  }, [seconds, start, timeThinkingEachTurn]);

  return (
    <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px' }}>
      Time: {seconds}
    </div>
  );
}

export default Timer;