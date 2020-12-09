import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import { authen } from '../../utils/helper';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function signin({ socket, isLoggedIn, setIsLoggedIn }) {
  const classes = useStyles();
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function Authen() {
      const status = await authen();
      if (status === 200) {
        history.push('/');
      }
    }
    Authen();
  }, []);


  const signUpClicked = () => {
    history.push('/signUp');
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const signIn = async () => {
      const data = {
        username: username,
        password: password
      };
      // console.log(data);
      const res = await fetch('http://localhost:8000/signin', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const result = await res.json();
      if (res.status === 200) {

        window.localStorage.setItem('jwtToken', result.token);
        window.localStorage.setItem('userID', result.id);
        window.localStorage.setItem('name', result.name);

        socket.emit('client_LoggedIn', { userID: result.id });

        setIsLoggedIn(true);
        history.push("/games");

      } else {
        alert(result.mesg);
      }
    }
    // call API here
    signIn();
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField id="username" name="username" label="Username" variant="outlined"
            margin="normal" required fullWidth autoComplete="username" autoFocus
            onChange={e => setUsername(e.target.value)}
          />
          <TextField id="password" name="password" label="Password" type="password"
            variant="outlined" margin="normal" required fullWidth autoComplete="current-password"
            onChange={e => setPassword(e.target.value)}
          />
          <Button className={classes.submit} type="submit" fullWidth variant="contained" color="primary">
            Sign In
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link onClick={signUpClicked} variant="body2" style={{ cursor: 'pointer ' }}>
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}

export default signin;