import React from 'react';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

import defaultAvatar from '../../images/defaultAvatar.jpg';

function Player({player, xOrO}) {
  return (
    <div style={{ border: `3px solid ${xOrO === "X" ? "blue" : "red"}` }}>
      <CardMedia image={player.Avatar == null ? defaultAvatar : player.Avatar}
        style={{ height: '120px', width: '200px' }}
      />
      <Typography>Name: {player.Name}</Typography>
      <Typography>Elo: {player.Elo}</Typography>
    </div>
  );
}

export default Player;