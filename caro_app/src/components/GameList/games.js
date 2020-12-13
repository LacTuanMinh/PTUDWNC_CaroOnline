import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Fab from '@material-ui/core/Fab';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { authen } from '../../utils/helper'
import GameList from './gamelist';
import config from '../../constants/config.json';
const API_URL = config.API_URL_TEST;
const jwtToken = window.localStorage.getItem('jwtToken');

const useStyles = makeStyles((theme) => ({
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(4, 0, 2),
  },
  cardGrid: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  card: {
    height: '100%',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '25%',
  },
  cardContent: {
    flexGrow: 1,
  },
  fab: {
    width: '35%',
    height: '35%',
    fontSize: '50px',
  }
}));

function Games({ socket }) {
  const classes = useStyles();
  const history = useHistory();
  const userID = localStorage.getItem('userID');
  const [open, setOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState(null);
  const [isBlockedRule, setIsBlockedRule] = useState(false);

  useEffect(() => {
    async function Authen() {
      const status = await authen();
      if (status === 401) {
        history.push('/signin')
      }
    }
    Authen();
  }, []);

  useEffect(() => {
    async function getAllGames() {
      const res = await fetch(`${API_URL}/games/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        }
      });
      const result = await res.json();
      console.log(result);
      setGames(result.games);
    }
    getAllGames();
  }, []);

  const addGameButtonClicked = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const handleCreate = async () => {
    const data = {
      name: name,
      password: password,
      isBlockedRule: isBlockedRule,
      userID: userID
    }
    console.log(data);
    const res = await fetch(`${API_URL}/games/add`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`
      }
    });
    const result = await res.json();
    if (res.status === 200) {
      console.log(result.msg);
      history.push('/games/' + result.game.ID);
    } else {
      window.alert(result.msg);
    }
  }

  return (
    <React.Fragment>
      <main>
        {/* Hero unit */}
        <div className={classes.heroContent}>
          <Container maxWidth="sm">
            <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
              Games layout
            </Typography>
          </Container>
        </div>
        <Container className={classes.cardGrid} maxWidth="md">
          {/* End hero unit */}
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Card className={classes.card}>
                <CardMedia className={classes.cardMedia}>
                  <Fab className={classes.fab} color="primary" aria-label="Add"
                    onClick={addGameButtonClicked}>
                    +
                  </Fab>
                </CardMedia>
                <CardContent className={classes.cardContent}>
                  <Typography gutterBottom variant="h5" component="h2">
                    Create a new game
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <GameList
              games={games}
              socket={socket}
            />
          </Grid>
          <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Game Information</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please enter the information for the game
              </DialogContentText>
              <TextField id="name" label="Name" autoFocus margin="dense" required
                fullWidth onChange={e => setName(e.target.value)}
              />
              <TextField id="password" label="Password" margin="dense"
                fullWidth onChange={e => setPassword(e.target.value)}
              />
              <Typography style={{display: "inline-block"}}>
                Is Blocked Rule
              </Typography>
              <Checkbox onChange={e => setIsBlockedRule(e.target.checked)} />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleCreate} color="primary">
                Create
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </main>
    </React.Fragment>
  );
}

export default Games;