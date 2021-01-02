import React from 'react';

function Square({value, isHighlight, onClick}) {
  const className = "square" + (isHighlight ? " yellow" : "");
  return (
    <button className={className} onClick={onClick} style={{ color: value === "X" ? 'blue' : 'red' }}>
      {value}
    </button>
  )
}

export default Square;