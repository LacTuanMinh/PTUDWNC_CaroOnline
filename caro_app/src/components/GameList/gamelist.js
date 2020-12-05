import React from 'react';
import GameItem from './gameitem';

function GameList({ games }) {
  return (
    <React.Fragment>
      {games.map((game) => (
        <GameItem
          key={game.id}
          game={game}
        />
      ))}
    </React.Fragment>
  );
}

export default GameList;