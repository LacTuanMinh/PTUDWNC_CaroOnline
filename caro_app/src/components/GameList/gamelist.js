import React from 'react';
import GameItem from './gameitem';

function GameList({ games, socket }) {
  return (
    <React.Fragment>
      {games.map((game) => (
        <GameItem
          key={game.ID}
          game={game}
          socket={socket}
        />
      ))}
    </React.Fragment>
  );
}

export default GameList;