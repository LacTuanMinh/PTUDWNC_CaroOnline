import React from 'react';
import { NavLink } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import logo from '../../images/caro.ico';

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

function Navbar({isLoggedIn, setIsLoggedIn}) {
  const classes = useStyles();

  const logoutButtonClicked = () => {
    setIsLoggedIn(false);
    window.localStorage.clear();
  }

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
            <NavLink to='/' className={classes.navLink}>
              <Button variant="contained" color="secondary">
                Home
              </Button>
            </NavLink>
            {/* <NavLink to='/games' className={classes.navLink}>
              <Button variant="contained" color="secondary">
                Games
              </Button>
            </NavLink> */}
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
              </React.Fragment>}
          </div>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

export default Navbar;