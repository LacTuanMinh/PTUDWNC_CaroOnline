import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Fab from '@material-ui/core/Fab';
import { authen } from '../../utils/helper'
import GameList from './gamelist';

const games = [
  {
    id: 1,
    name: "Game 1",
    password: "123456"
  },
  {
    id: 2,
    name: "Game 2",
    password: null
  }
];

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

function Games() {
  const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    async function Authen() {
      const status = await authen();
      if (status === 401) {
        history.push('/signin')
      }
    }
    Authen();
  });

  const addGameButtonClicked = () => {

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
            />
          </Grid>
        </Container>
      </main>
    </React.Fragment>
  );
}

export default Games;