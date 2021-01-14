import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { authen, isBlankString, containsBlank, isEmailPattern } from '../../utils/helper'
import { InformationSnackbar } from '../SnackBar/snackbar';
import config from '../../constants/config.json';

const API_URL = config.API_URL_TEST;
// function Copyright() {
//   return (
//     <Typography variant="body2" color="textSecondary" align="center">
//       {'Copyright © '}
//       <Link color="inherit" href="https://material-ui.com/">
//         Your Website
//       </Link>{' '}
//       {new Date().getFullYear()}
//       {'.'}
//     </Typography>
//   );
// }

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
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function SignUp({ socket, isLoggedIn, setIsLoggedIn }) {
  const history = useHistory();
  const classes = useStyles();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSnackbar, setShowSnackBar] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    async function Authen() {
      const status = await authen();
      if (status === 200) {
        history.push('/');
      }
    }
    Authen();
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: name,
      username: username,
      email: email,
      password: password
    }

    if (isBlankString(data.username) || isBlankString(data.password) || isBlankString(data.name) || isBlankString(data.email)) {
      setContent('Some input fields are an empty string.');
      setShowSnackBar(true);
      return;
    }

    if (containsBlank(data.username)) {
      setContent('Username can not contain blank space.');
      setShowSnackBar(true);
      return;
    }

    if (data.password.length < 6) {
      setContent('Password must be 6 characters at least.');
      setShowSnackBar(true);
      return;
    }

    if (!isEmailPattern(data.email)) {
      setContent('Email is not valid.');
      setShowSnackBar(true);
      return;
    }

    // call API here
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const result = await res.json();
    if (res.status === 200 || res.status === 500 || res.status === 400) {
      setContent(result.msg);
      setShowSnackBar(true);
    }
  }

  const signInClicked = () => {
    history.push('/signIn');
  }

  return (
    <Container component="main" maxWidth="xs">
      <InformationSnackbar open={showSnackbar} setOpen={(isOpen) => setShowSnackBar(isOpen)} content={content} />
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField id="name" name="name" label="Name" autoComplete="name"
                variant="outlined" required fullWidth autoFocus
                onChange={e => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField id="username" name="username" label="Username" autoComplete="username"
                variant="outlined" required fullWidth
                onChange={e => setUsername(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField id="email" name="email" label="Email Address" autoComplete="email"
                variant="outlined" required fullWidth
                onChange={e => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField id="password" name="password" label="Password" type="password"
                autoComplete="current-password" variant="outlined" required fullWidth
                onChange={e => setPassword(e.target.value)}
              />
            </Grid>
          </Grid>
          <Button className={classes.submit} type="submit" variant="contained" color="primary" fullWidth>
            Sign Up
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link onClick={signInClicked} variant="body2" style={{ cursor: 'pointer ' }}>
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      {/* <Box mt={5}>
        <Copyright />
      </Box> */}
    </Container>
  );
}

export default SignUp;