import React, { useEffect } from 'react';
import { NavLink, useHistory, Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import logo from '../../images/caro.ico';
import config from '../../constants/config.json';
const API_URL = config.API_URL_TEST;

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  navLink: {
    textDecoration: 'none',
    paddingLeft: '5px'
  },
  button: {
    color: 'white',
    background: 'purple'
  },
  logo: {
    width: '25px',
    height: '25px',
    marginRight: '10px'
  }
}));

export default function Navbar({ socket, isLoggedIn, setIsLoggedIn }) {
  const classes = useStyles();
  const history = useHistory();
  const userID = localStorage.getItem('userID');
  const token = localStorage.getItem('jwtToken');

  useEffect(() => {
    function storageChange(event) {
      if (event.key === 'jwtToken') {
        if (event.newValue === null) {
          setIsLoggedIn(false);
          socket.emit('client_LoggedOut', { userID });
          history.push('/signin');
          return;

        } else {
          setIsLoggedIn(true);
          history.push('/');
          return;
        }
      }
    }
    window.addEventListener('storage', storageChange);
    return () => {
      window.removeEventListener('storage', storageChange);
    }
  }, []);

  const logoutButtonClicked = async () => {
    const data = {
      userID
    }
    const res = await fetch(`${API_URL}/users/signout`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    if (res.status === 400) {
      const result = await res.json();
      alert(result.mesg);

    }
    else { // other status: 200, 401, ...
      setIsLoggedIn(false);
      localStorage.removeItem('jwtToken');
      localStorage.clear();
      history.push('/');

      if (res.status === 200) // only status 200
      {
        socket.emit('client_LoggedOut', { userID: data.userID });
      }
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar>
          <NavLink to="/" style={{ display: 'inline-block', textDecoration: 'none', color: "white" }}>
            <img className={classes.logo} src={logo} alt="This is my website logo"></img>
          </NavLink>

          <Typography variant="h6" color="inherit" noWrap style={{ flex: 1 }}>
            <NavLink to="/" style={{ display: 'inline-block', textDecoration: 'none', color: "white" }}>
              Caro Tournament
            </NavLink>
          </Typography>

          <div>
            <Link to='/' className={classes.navLink}>
              <Button variant="contained" color="secondary">
                Home
              </Button>
            </Link>
            <NavLink to='/games' className={classes.navLink}>
              <Button variant="contained" color="secondary">
                Games
              </Button>
            </NavLink>

            {isLoggedIn ?
              <React.Fragment>
                <NavLink to='/profile' className={classes.navLink}>
                  <Button variant="contained" color="secondary">
                    Profile
                </Button>
                </NavLink>
                <NavLink to='/' className={classes.navLink}>
                  <Button variant="contained" color="secondary" onClick={logoutButtonClicked}>
                    Sign Out
                </Button>
                </NavLink>
              </React.Fragment> :
              <React.Fragment>
                <NavLink to='/signIn' className={classes.navLink}>
                  <Button variant="contained" color="secondary">
                    Sign In
                </Button>
                </NavLink>
                <NavLink to='/signUp' className={classes.navLink}>
                  <Button variant="contained" color="secondary">
                    Sign Up
                </Button>
                </NavLink>
              </React.Fragment>}

          </div>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}
