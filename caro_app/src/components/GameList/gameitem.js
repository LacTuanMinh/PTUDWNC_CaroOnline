import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import LockIcon from '@material-ui/icons/Lock';
import TimerIcon from '@material-ui/icons/Timer';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  }
}));

function GameItem({ game, socket }) {
  const classes = useStyles();
  const history = useHistory();
  const userID = localStorage.getItem('userID');
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [wrongPasswordAlert, setWrongPasswordAlert] = useState(false);

  const handleClose = () => {
    setOpen(false);
  }

  const handleJoinWithPassword = () => {
    if (password === game.Password) {
      history.push('/games/' + game.ID);
      socket.emit("join_game", { gameID: game.ID, userID });
    }
    else setWrongPasswordAlert(true);
  }

  const joinGame = () => {
    if (game.Password === null) {
      history.push('/games/' + game.ID);
      socket.emit("join_game", { gameID: game.ID, userID });
    }
    else setOpen(true);
  }

  return (
    <React.Fragment>
      <Grid item xs={12} sm={6} md={3}>
        <Card className={classes.card}>
          <CardMedia
            className={classes.cardMedia}
            image="https://source.unsplash.com/random"
            title="Image title"
          />
          <CardContent className={classes.cardContent}>
            <Typography gutterBottom variant="h5" component="h2">
              {game.Name}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" color="primary" style={{ fontWeight: "bold" }} onClick={joinGame}>
              Join
            </Button>
            {game.Password !== null ?
              <LockIcon size="small" color="primary"></LockIcon>
              : <React.Fragment></React.Fragment>}
            {game.IsBlockedRule ? <Typography style={{ fontWeight: "bold" }}>Blocked Rule</Typography>
              : <React.Fragment></React.Fragment>}
            <TimerIcon size="small" color="primary"></TimerIcon>
            <Typography>{game.TimeThinkingEachTurn}s</Typography>
          </CardActions>
        </Card>
      </Grid>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">This table(game) requires password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the table(game) password
          </DialogContentText>
          <TextField id="password" label="Password" autoFocus margin="dense" required
            fullWidth onChange={e => setPassword(e.target.value)}
          />
          {wrongPasswordAlert ?
            <Typography style={{ color: "red" }}>
              Wrong Password
          </Typography> :
            <React.Fragment></React.Fragment>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleJoinWithPassword} color="primary">
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default GameItem;