import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
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
import SimpleSnackbar, { InformationSnackbar } from '../SnackBar/snackbar';
import { makeStyles } from '@material-ui/core/styles';
import { isBlankString } from '../../utils/helper';
import config from '../../constants/config.json';
const API_URL = config.API_URL_TEST;

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

function ResetDestination({ isLoggedIn }) {
  const classes = useStyles();
  const history = useHistory();
  const reqID = useParams().id;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contents, setContents] = useState([]);
  const [showSnackbar, setShowSnackBar] = useState(false);

  useEffect(() => {
    async function Authen() {
      const res = await fetch(`${API_URL}/checkResetRequest`, {
        method: 'POST',
        body: JSON.stringify({ ID: reqID }),
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (res.status !== 200) {
        history.push('/');
      }
    };

    if (isLoggedIn) {
      history.push('/');
      return;
    }
    Authen();
  }, []);

  const handlePasswordChange = (password) => {
    setPassword(password);
    if (isBlankString(password) || password.length < 6) {
      setContents(contents => [...contents.filter(content => content.id !== 1), { id: 1, msg: "Password must be longer than 6 chars and not blank." }]);
    } else {
      setContents(contents.filter(content => content.id !== 1));
    }
  }

  const handleConfirmPasswordChange = (password) => {
    setConfirmPassword(password);
    if (isBlankString(password) || password.length < 6) {
      setContents(contents => [...contents.filter(content => content.id !== 1), { id: 1, msg: "Password must be longer than 6 chars and not blank." }]);
    } else {
      setContents(contents.filter(content => content.id !== 1));
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setContents(contents => [...contents.filter(content => content.id !== 2), { id: 2, msg: "Confirm password does not match." }]);
    } else {
      setContents(contents.filter(content => content.id !== 2));
    }

    if (contents.length > 0) {
      setShowSnackBar(true);
      return;
    }
    const data = {
      ID: reqID,
      password,
      confirmPassword
    }

    const res = await fetch(`${API_URL}/resetpassword`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const result = await res.json();
    if (res.status === 200) {
      setContents([]);
      setShowSnackBar(true);
    } else if (res.status === 500) {
      setContents([{ id: -1, msg: result.msg }]);
      setShowSnackBar(true);
    } else if (res.status === 400) {
      history.push('/');
    }
  }

  const signInClicked = () => {
    history.push('/signIn');
  }

  return (
    <Container component="main" maxWidth="xs">
      <SimpleSnackbar open={showSnackbar} setOpen={(isOpen) => setShowSnackBar(isOpen)} contents={contents} />

      <CssBaseline />
      <div className={classes.paper} style={{ marginBottom: '60px' }}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" style={{ color: 'red' }}>
          Reset your password
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField label="Password" variant="outlined"
            margin="normal" required fullWidth autoFocus type="password"
            onChange={e => handlePasswordChange(e.target.value)}
          />
          <TextField id="password" name="password" label="Confirm Password" type="password"
            variant="outlined" margin="normal" required fullWidth
            onChange={e => handleConfirmPasswordChange(e.target.value)}
          />
          <Button className={classes.submit} type="submit" fullWidth variant="contained" color="primary">
            Confirm
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link onClick={signInClicked} variant="body2" style={{ cursor: 'pointer ' }}>
                Go to sign in
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      {/* <Box mt={8}>
        <Copyright />
      </Box> */}
    </Container>
  );
}

export default ResetDestination;