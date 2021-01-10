import React, { useState, useEffect } from 'react';
import config from '../../constants/config.json';

const API_URL = config.API_URL_TEST;
let myTimeout = null;

function Timer({ counter, setCounter, start }) {
  // const [seconds, setSeconds] = useState(counter);

  // useEffect(() => {
  //   // setSeconds(counter);
  //   if (start === true) {
  //     myInterval = setInterval(() => {

  //       if (counter <= 0) {
  //         clearInterval(myInterval);
  //         setCounter(null);
  //       }
  //       else setCounter(counter - 1);
  //     }, 1000);
  //   }

  // }, [start]);

  useEffect(() => {
    clearTimeout(myTimeout);
    if (counter > 0) {
      myTimeout = setTimeout(() => {
        if (counter > 0) {
          setCounter(counter - 1)
        }
      }, 1000);
    } else {
      setCounter(0);
    }
  });

  return (
    <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px' }}>
      Time: {counter}
    </div>
  );
}

export default Timer;