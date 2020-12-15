import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import Input from '@material-ui/core/Input';
import CloseIcon from '@material-ui/icons/Close';
import FaceIcon from '@material-ui/icons/Face';
import Badge from '@material-ui/core/Badge';

const StyledBadge = withStyles((theme) => ({
  badge: {
    right: 5,
    top: 30,
    border: `1px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    background: ' green',
  },
}))(Badge);

const drawerWidth = 300;
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: drawerWidth,
  },
  title: {
    flexGrow: 1,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },
}));

export default function OnlineUsers({ onlineUserList }) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [onlineUserListCopy, setOnlineUserListCopy] = useState([]);

  const handleDrawerOpen = () => {
    setSearchString("");
    setOpen(true);
  }

  const handleDrawerClose = () => {
    setOpen(false);

  }
  useEffect(() => {
    setOnlineUserListCopy(onlineUserList.slice());
  }, [onlineUserList]);

  useEffect(() => {

    if (searchString !== "")// có nội dung cần tìm
    {
      console.log("v");
      setOnlineUserListCopy(onlineUserListCopy.slice()
        .filter(user => user.Name.toLowerCase().includes(searchString.toLowerCase())))
    } else {
      setOnlineUserListCopy(onlineUserList);
    }
  }, [searchString, onlineUserList]); // 2nd dependency help make sure new client connects will not make filtered list wrong


  return (
    <div className={classes.root}>
      <IconButton color="inherit" aria-label="open drawer" edge="end"
        onClick={handleDrawerOpen} className={clsx(open && classes.hide)}
        style={{
          position: 'absolute',
          top: -10,
          right: 50,
          zIndex: 1,
          alignContent: 'center',
          fontSize: '4',
          borderRadius: '50%',
          height: '60px',
          width: '60px',
          color: '#FFF',
          backgroundImage: 'linear-gradient(to right, #24C6DC 0%, #514A9D 100%)',
          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        }}
      >
        <GroupAddIcon />
      </IconButton>
      <Drawer className={classes.drawer} variant="temporary" anchor="right"
        open={open} classes={{ paper: classes.drawerPaper }} onClose={handleDrawerClose}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            <CloseIcon />
          </IconButton>
          <Input placeholder="Username here"
            onChange={(event) => { setSearchString(event.target.value) }}
          />
        </div>
        <Divider />
        <List>
          {onlineUserListCopy.map((item) => (
            <ListItem key={item.ID}>
              <ListItemIcon >
                <StyledBadge badgeContent={""} >
                  <FaceIcon fontSize="large" />
                </StyledBadge>
              </ListItemIcon>
              <ListItemText primary={item.Name} />
              <Button variant="outlined" style={{ fontSize: '12px', borderRadius: '5px', padding: '2px' }}>Invite</Button>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </div>
  );
}
