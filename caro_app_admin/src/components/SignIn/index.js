import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import { authen, isBlankString } from '../../utils/helper';
import config from '../../constants/config.json';
import SimpleSnackbar from '../SnackBar/snackbar';

const API_URL = config.API_URL_TEST

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

function SignIn({ isLoggedIn, setIsLoggedIn }) {
  const classes = useStyles();
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [validUserName, setValidUserName] = useState(false);
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [contents, setContents] = useState([]);
  const [showSnackbar, setShowSnackBar] = useState(false);

  useEffect(() => {
    async function Authen() {
      const status = await authen();
      if (status === 200) {
        history.push('/');
      }
    }
    Authen();
  }, [history]);

  const handleUsernameChange = (username) => {
    setUsername(username);
    if (isBlankString(username)) {
      setContents(contents => [...contents.filter(content => content.id !== 1), { id: 1, msg: "Username can't be empty." }]);
      setValidUserName(false);
    } else {
      setContents(contents.filter(content => content.id !== 1));
      setValidUserName(true);
    }
  }

  const handlePasswordChange = (password) => {
    setPassword(password);
    if (isBlankString(password) || password.length < 6) {
      setContents(contents => [...contents.filter(content => content.id !== 2), { id: 2, msg: "Pasword can't be empty or shorter than 6 chars" }]);
      setValidPassword(false);
    } else {
      setContents(contents.filter(content => content.id !== 2));
      setValidPassword(true);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const signIn = async () => {
      const data = {
        username: username,
        password: password
      };

      if (!validUserName || !validPassword) {
        setShowSnackBar(true);
        return;
      }

      const res = await fetch(`${API_URL}/signin`, {
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

        setIsLoggedIn(true);

        history.push("/");

      } else {
        alert(result.mesg);
      }
    }
    // call API here
    signIn();
  }

  return (
    <Container component="main" maxWidth="xs">
      <SimpleSnackbar open={showSnackbar} setOpen={(isOpen) => setShowSnackBar(isOpen)} contents={contents} />

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
            onChange={e => handleUsernameChange(e.target.value)}
          />
          <TextField id="password" name="password" label="Password" type="password"
            variant="outlined" margin="normal" required fullWidth autoComplete="current-password"
            onChange={e => handlePasswordChange(e.target.value)}
          />
          <Button className={classes.submit} type="submit" fullWidth variant="contained" color="primary">
            Sign In
          </Button>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}

export default SignIn;