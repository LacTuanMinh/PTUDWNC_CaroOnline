import React, { useState } from 'react';
import OnlineUsers from '../OnlineUsers/onlineUsers_Primary';
import background from '../../images/background.jpg';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import EloRanking from '../Ranking/ranking';
import { useHistory } from 'react-router-dom';
import { authen } from '../../utils/helper';
import config from '../../constants/config.json';
const API_URL = config.API_URL_TEST;

const homeBackground = {
  marginTop: '-20px',
  borderRadius: '0 0 0 200%',
  borderTopWidth: '0',
  width: '100%',
  boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
}


function Home({ onlineUserList, socket }) {
  const jwtToken = window.localStorage.getItem('jwtToken');
  const userID = localStorage.getItem('userID');
  const history = useHistory();
  const [gameId, setGameId] = useState("");
  const [gamePassword, setGamePassword] = useState("");
  const [openJoinByID, setOpenJoinByID] = useState(false);
  const [openPairing, setOpenPairing] = useState(false);

  const handleClickOpenJoinByID = async () => {
    const status = await authen();
    if (status === 401) {
      alert('Log in please');
      history.push('/signin');
      return;
    }
    setOpenJoinByID(true);
  };

  const handleClickOpenPairing = async () => {
    const status = await authen();
    if (status === 401) {
      alert('Log in please');
      history.push('/signin');
      return;
    }
    setOpenPairing(true);
    socket.emit('find_opponent', { userID });
    socket.on(`pair_successfully_${userID}`, (data) => {
      history.push('/games/' + data.gameID);
    })
  }

  const handleCloseJoinByID = () => {
    setOpenJoinByID(false);
    setGameId("");
    setGamePassword("");
  };

  const handleClosePairing = () => {
    socket.emit('remove_pairing', { userID });
    setOpenPairing(false);
  }

  const handleJoinGameByID = async () => {

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
    <>
      <div style={{ position: 'relative', marginBottom: '100px' }}>
        <img src={background} style={homeBackground} alt="Home background" />
        <div>
          <OnlineUsers onlineUserList={onlineUserList} />
        </div>
        <div style={{ position: 'absolute', left: '5%', bottom: '20%', width: '25%' }}>
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div>
              <Button style={{ marginRight: '0.5vw', width: '10vw' }} fullWidth variant="outlined" color="secondary" onClick={handleClickOpenJoinByID} >
                Join Game
            </Button>
            </div>
            <div>
              <Button style={{ marginLeft: '0.5vw', width: '10vw' }} fullWidth variant="contained" color="primary" onClick={handleClickOpenPairing} >
                Quick join
            </Button>
            </div>
          </div>
          <Dialog open={openJoinByID} onClose={handleCloseJoinByID} aria-labelledby="form-dialog-title">
            <form >
              <DialogTitle id="form-dialog-title">Provide Game ID to join</DialogTitle>
              <DialogContent>

                <TextField autoFocus margin="dense" label="Game ID" fullWidth
                  onChange={(event) => { setGameId(event.target.value); }}
                />
                <TextField margin="dense" label="Password (if needed)" fullWidth
                  onChange={(event) => { setGamePassword(event.target.value); }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleJoinGameByID} color="secondary">
                  Go
              </Button>
                <Button onClick={handleCloseJoinByID} color="primary">
                  Cancel
              </Button>
              </DialogActions>
            </form>
          </Dialog>
          <Dialog fullWidth style={{ textAlign: 'center' }} open={openPairing} onClose={handleClosePairing}>
            <DialogContent >
              <CircularProgress />
              <Typography variant='h6'>Please wait, we are browsing a suitable opponent for you</Typography>
            </DialogContent>
          </Dialog>
        </div>
      </div >
      <EloRanking />
    </>
  );
}
export default Home;