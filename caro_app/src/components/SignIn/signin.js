import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import ResetPasswordDialog from '../Dialogs/ResetPasswordDialog';
import SimpleSnackbar from '../SnackBar/snackbar';
import FacebookIcon from '@material-ui/icons/Facebook';
import GoogleIcon from '../../images/google.png';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import GoogleLogin from 'react-google-login';
import { makeStyles } from '@material-ui/core/styles';
import { authen, isBlankString } from '../../utils/helper';
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
  shadow: {
    boxShadow: '4px 4px 8px 4px rgba(0, 0, 0, 0.2), 4px 6px 20px 4px rgba(0, 0, 0, 0.19)',
  },
  socialLoginButton: {
    display: 'table',
    width: '300px',
    height: '50px',
    fontWeight: 'bolder',
    textAlign: 'center',
    borderRadius: '5px',
    margin: '20px',
    cursor: 'pointer'
  },
  facebook: {
    border: '1px solid  #3b5998',
    backgroundColor: ' #3b5998',
    color: 'white',
  },
  google: {
    border: '1px solid  #f1f3f4',
    backgroundColor: ' #f1f3f4',
    color: 'black',
  }
}));

function SignIn({ socket, isLoggedIn, setIsLoggedIn }) {
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
        socket.emit('client_LoggedIn', { userID: result.id });
        setIsLoggedIn(true);
        history.push("/games");
      } else {
        // alert(result.mesg);
        setContents([{ id: -1, msg: result.msg }]);
        setShowSnackBar(true);
      }
    }
    // call API here
    signIn();
  }

  const responseFacebook = async (response) => {

    const data = {
      name: response.name,
      email: response.email,
      id: response.id
    };

    const res = await fetch(`${API_URL}/auth/socialmedia`, {
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
      alert("Welcome to our app");
      setIsLoggedIn(true);
      history.push("/");
    } else {
      // alert(result.mesg);
      setContents([{ id: -1, msg: result.msg }]);
      setShowSnackBar(true);
    }
  }

  const responseGoogle = async (response) => {
    console.log(response);

    const data = {
      name: response.profileObj.name,
      email: response.profileObj.email,
      id: response.googleId
    };
    const res = await fetch(`${API_URL}/auth/socialmedia`, {
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
      alert("Welcome to our app");
      setIsLoggedIn(true);
      history.push("/");
    } else {
      // alert(result.mesg);
      setContents([{ id: -1, msg: result.msg }]);
      setShowSnackBar(true);
    }
  }


  return (
    <Container component="main" maxWidth="md">
      <SimpleSnackbar open={showSnackbar} setOpen={(isOpen) => setShowSnackBar(isOpen)} contents={contents} />

      <CssBaseline />

      <Grid container spacing={6} /*style={{ paddingLeft: '100px', paddingRight: '100px' }}*/>
        <Grid item xs={12} sm={5} md={5} >
          <div className={classes.paper} style={{ marginBottom: '60px' }}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Welcome To Our Page
            </Typography>
            <Link onClick={signUpClicked} variant="body2" style={{ cursor: 'pointer', margin: '10px' }}>
              {"Don't have an account? Sign up"}
            </Link>
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
              <Grid container justify="flex-end">
                <Grid item>
                  <ResetPasswordDialog />
                </Grid>
              </Grid>
            </form>
          </div>
        </Grid>

        <Grid item xs={12} sm={2} md={2} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Divider orientation="vertical" style={{ height: '35vh' }} />
          <span style={{ margin: '15px' }}>OR</span>
          <Divider orientation="vertical" style={{ height: '45vh' }} />
        </Grid>

        <Grid item xs={12} sm={5} md={5} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <FacebookLogin
            appId="384191462701845"
            autoLoad={false}
            fields="name,email,picture"
            // onClick={componentClicked}
            callback={responseFacebook}
            render={renderProps => (
              <div className={`${classes.socialLoginButton} ${classes.facebook} ${classes.shadow}`}>
                <Typography onClick={renderProps.onClick} style={{ display: 'table-cell', verticalAlign: 'middle', fontWeight: 'bold' }}> <FacebookIcon style={{ margin: '10px', verticalAlign: 'middle' }} />Sign in with FaceBook</Typography>
              </div>
            )}
          />
          <GoogleLogin
            clientId="226602372235-lp2s47icle0bm0c58rnsp58f9a4tuid3.apps.googleusercontent.com" // clientID này của account: lactuanminh2121
            render={renderProps => (
              <div className={`${classes.socialLoginButton} ${classes.google} ${classes.shadow}`} onClick={renderProps.onClick}>
                <Typography style={{ display: 'table-cell', verticalAlign: 'middle', fontWeight: 'bold' }}>
                  <img src={GoogleIcon} alt="Google icon" style={{ width: '25px', height: '25px', margin: '10px', verticalAlign: 'middle' }} />
                    Sign in with Google
                </Typography>
              </div>)}
            buttonText="Login"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            cookiePolicy={'single_host_origin'}
          />
        </Grid>
      </Grid>

    </Container>
  );
}

export default SignIn;