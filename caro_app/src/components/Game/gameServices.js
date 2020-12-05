import config from '../../constants/config.json';

function calculateWinner(squares, pos) {
  const position = parseInt(pos, 10);
  if (position === -1) {
    return {
      winner : null,
      winLine: null,
      isDraw: false
    }
  }

  const nCol = config.boardSize;
  const nRow = config.boardSize;

  // win condition
  let N = 5;

  //#region check for the column win line
  let start = position;
  for (let i = 0; i < N - 1; i++) {
    if (start < nCol) {
      break;
    }
    start -= nCol;
  }
  let end = position;
  for (let i = 0; i < N - 1; i++) {
    if (end + nCol >= nCol * nRow) {
      break;
    }
    end += nCol;
  }

  let jumpStep = nCol;
  let winLine = [];
  for (let i = start; i <= end; i += jumpStep) {
    if (squares[i] === squares[position] && squares[i] != null) {
      winLine.push(i);
    }
    else {
      winLine = [];
    }
    if (winLine.length === N) {
      return {
        winner: squares[position],
        winLine: winLine,
        isDraw: false
      }
    }
  }
  //#endregion
  
  //#region check for the row win line
  start = position
  for (let i = 0; i < N - 1; i++) {
    if (start % nCol === 0) {
      break;
    }
    start -= 1;
  }
  end = position
  for (let i = 0; i < N - 1; i++) {
    if (end % nCol === nCol - 1) {
      break;
    }
    end += 1;
  }

  jumpStep = 1;
  winLine = [];
  for (let i = start; i <= end; i += jumpStep) {
    if (squares[i] === squares[position] && squares[i] != null) {
      winLine.push(i);
    }
    else {
      winLine = [];
    }
    if (winLine.length === N) {
      return {
        winner: squares[position],
        winLine: winLine,
        isDraw: false
      }
    }
  }
  //#endregion

  //#region check for the left diagonal win line
  /*
    X . .
    . X .
    . . X
  */
  start = position
  for (let i = 0; i < N - 1; i++) {
    if (start % nCol === 0 || start < nCol) {
      break;
    }
    start -= (nCol + 1);
  }
  end = position;
  for (let i = 0; i < N - 1; i++) {
    if (end % nCol === nCol - 1 || end + nCol + 1 > nCol * nRow) {
      break;
    }
    end += nCol + 1;
  }

  jumpStep = nCol + 1;
  winLine = [];
  for (let i = start; i <= end; i += jumpStep) {
    if (squares[i] === squares[position] && squares[i] != null) {
      winLine.push(i);
    }
    else {
      winLine = [];
    }
    if (winLine.length === N) {
      return {
        winner: squares[position],
        winLine: winLine,
        isDraw: false
      }
    }
  }
  //#endregion

  //#region check for the right diagonal win line
  /*
    . . X
    . X .
    X . .
  */
  start = position
  for (let i = 0; i < N - 1; i++) {
    if (start % nCol === nCol - 1 || start < nCol) {
      break;
    }
    start -= (nCol - 1);
  }
  end = position;
  for (let i = 0; i < N - 1; i++) {
    if (end % nCol === 0 || end + nCol > nCol * nRow) {
      break;
    }
    end += nCol - 1;
  }

  jumpStep = nCol - 1;
  winLine = [];
  for (let i = start; i <= end; i += jumpStep) {
    if (squares[i] === squares[position] && squares[i] != null) {
      winLine.push(i);
    }
    else {
      winLine = [];
    }
    if (winLine.length === N) {
      return {
        winner: squares[position],
        winLine: winLine,
        isDraw: false
      }
    }
  }
  //#endregion

  //#region check for draw
  if (squares.length === nCol * nRow) {
    for (let i = 0; i < squares.length; i++) {
      if (squares[i] == null) {
        return {
          winner : null,
          winLine: null,
          isDraw: false
        }
      }
    }
    return {
      winner : null,
      winLine: null,
      isDraw: true
    }
  }
  //#endregion

  return {
    winner : null,
    winLine: null,
    isDraw: false
  }
}

export default calculateWinner;
