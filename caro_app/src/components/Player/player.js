import React, { useState, useEffect } from 'react';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import defaultAvatar from '../../images/defaultAvatar.jpg';
import config from '../../constants/config.json';
const API_URL = config.API_URL_TEST;

function Player({ player, xOrO }) {

  const token = localStorage.getItem('jwtToken');
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    async function retrieveAvatar() {

      const res = await fetch(`${API_URL}/users/avatar/${player.ID}`, {
        method: 'GET',
        headers: {
          ContentType: 'image/jpeg',
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 200) {
        const result = await res.blob();
        setAvatar(URL.createObjectURL(result));
      }
    }

    if (player.ID) {
      retrieveAvatar();
    }
  }, [player.ID]);
  return (
    <div style={{ border: `3px solid ${xOrO === "X" ? "blue" : "red"}` }}>
      <CardMedia image={avatar ? avatar : defaultAvatar}
        style={{ height: '120px', width: '200px' }}
      />
      <Typography>Name: {player.Name}</Typography>
      <Typography>Elo: {player.Elo}</Typography>
    </div>
  );
}

export default Player;