import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CameraIcon from '@material-ui/icons/PhotoCamera';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

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
  }
}));

function Navbar() {
  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const logoutButtonClicked = () => {
    setIsLoggedIn(false);
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <CameraIcon className={classes.icon} />
          <Typography variant="h6" color="inherit" noWrap style={{ flex: 1 }}>
            Caro Tournament
          </Typography>
          <div>
            <NavLink to='/' className={classes.navLink}>
              <Button className={classes.button}>
                Home
              </Button>
            </NavLink>
            <NavLink to='/games' className={classes.navLink}>
              <Button className={classes.button}>
                Games
              </Button>
            </NavLink>
            {isLoggedIn ? 
            <React.Fragment>
              <NavLink to='/profile' className={classes.navLink}>
                <Button className={classes.button}>
                  Profile
                </Button>
              </NavLink>
              <NavLink to='/' className={classes.navLink}>
                <Button className={classes.button} onClick={logoutButtonClicked}>
                  Sign Out
                </Button>
              </NavLink>
            </React.Fragment> : 
            <React.Fragment>
              <NavLink to='/login' className={classes.navLink}>
                <Button className={classes.button}>
                  Login
                </Button>
              </NavLink>
              <NavLink to='/signUp' className={classes.navLink}>
                <Button className={classes.button}>
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

export default Navbar;