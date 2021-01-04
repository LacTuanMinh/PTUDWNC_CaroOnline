import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function InvitationDialog({ socket }) {
  const userID = localStorage.getItem('userID');
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const [hostName, setHostName] = useState("");
  const [gameID, setGameID] = useState("");

  useEffect(() => {
    socket.on(`invite_${userID}`, data => {
      setHostName(data.hostName);
      setGameID(data.gameID);
      setOpen(true);
    });
  }, [userID]);

  const handleClose = () => {
    setOpen(false);
    setHostName("");
    setGameID("")
  };

  const handleJoinGame = () => {
    setOpen(false);
    history.push('/games/' + gameID);
    socket.emit("join_game", { gameID: gameID, userID });
  }

  return (
    <div>
      {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Slide in alert dialog
      </Button> */}
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title"><Typography variant="h4">{`Invitation`}</Typography></DialogTitle>
        <DialogContent >
          <DialogContentText id="alert-dialog-slide-description" style={{ fontSize: '18px' }}>
            <b>{hostName}</b> wants you to join the room
            <br />
            {gameID}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleJoinGame} color="secondary">
            Agree
          </Button>
          <Button onClick={handleClose} color="primary">
            Disagree
          </Button>

        </DialogActions>
      </Dialog>
    </div>
  );
}
