import React from 'react';
import Square from './square'
import config from '../../constants/config.json';

function Board({squares, winLine, onClick}) {
  const boardSize = config.boardSize;
  const renderSquare = (i) => {  
    return (
      <Square
        key={i}
        value={squares[i]}
        isHighlight={winLine && winLine.includes(i)}
        onClick={() => onClick(i)}
      />
    );
  };

  const createSquares = () => {
    let squares = [];
    for (let i = 0; i < boardSize; i++) {
      let rows = [];
      for (let j = 0; j < boardSize; j++) {
        rows.push(renderSquare(boardSize * i + j));
      }
      squares.push(
        <div key={i} className="board-row">
          {rows}
        </div>
      );
    }
    return squares;
  };

  return (
    <div>
      {createSquares()}
    </div>
  );
}

export default Board;