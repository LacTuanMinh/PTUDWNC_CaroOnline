import React, { useState } from 'react';
import OnlineUsers from '../OnlineUsers/onlineUsers_Primary';
import background from '../../images/background.jpg';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useHistory } from 'react-router-dom';
import { authen } from '../../utils/helper';
import config from '../../constants/config.json';
const API_URL = config.API_URL_TEST;

const homeBackground = {
  marginTop: '-20px',
  borderRadius: '0 0 0 200%',
  // border: '1px solid grey',
  borderTopWidth: '0',
  width: '100%',
  boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
}

function Home({ onlineUserList, socket }) {
  const history = useHistory();
  const [gameId, setGameId] = useState("");
  const [gamePassword, setGamePassword] = useState("");
  const [open, setOpen] = useState(false);
  const userID = localStorage.getItem('userID');

  const handleClickOpen = async () => {
    const status = await authen();
    if (status === 401) {
      alert('Log in please');
      history.push('/signin');
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setGameId("");
    setGamePassword("");
  };

  const handleQuickJoin = async () => {

    // history.push("/games");


    const jwtToken = window.localStorage.getItem('jwtToken');
    const data = {
      gameID: gameId,
      password: gamePassword
    }
    const res = await fetch(`${API_URL}/games/joinbyid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.status === 200) {
      history.push('/games/' + result.gameID);
      socket.emit("join_game", { gameID: result.gameID, userID });
    } else {
      alert(result.msg);
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <img src={background} style={homeBackground} />
      <div>
        <OnlineUsers onlineUserList={onlineUserList} />
      </div>
      <div style={{ position: 'absolute', left: '10%', bottom: '15%' }}>
        <Button fullWidth variant="outlined" color="secondary" onClick={handleClickOpen} >
          Quick join
        </Button>
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
          <form >
            <DialogTitle id="form-dialog-title">Provide Game ID to join</DialogTitle>
            <DialogContent>

              <TextField
                autoFocus
                margin="dense"
                label="Game ID"
                fullWidth
                onChange={(event) => { setGameId(event.target.value); }}
              />
              <TextField
                autoFocus
                margin="dense"
                label="Password (if has)"
                fullWidth
                onChange={(event) => { setGamePassword(event.target.value); }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleQuickJoin} color="secondary">
                Go
              </Button>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    </div>
  );
}
export default Home;