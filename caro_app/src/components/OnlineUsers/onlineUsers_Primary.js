import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import MinimizeIcon from '@material-ui/icons/Minimize';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Input from '@material-ui/core/Input';
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
  list: {
    position: "fixed",
    right: 30,
    bottom: 0,
    border: '2px solid grey',
    borderBottomWidth: '0',
    width: '300px',
    borderRadius: '8px 8px 0 0',
    maxHeight: '80%',
    // overflowY: 'scroll',
    overflow: 'auto',
    background: '#f2f2f2'
  },
  card: {
    position: "fixed",
    right: 30,
    bottom: 0,
    border: `1px solid #3f51b5`,
    borderRadius: '5px 5px 0 0',
    width: '300px',
    height: '50px',
    background: '#3f51b5',
    cursor: 'pointer',
    display: 'inline-block',
    color: 'white',
    padding: '15px',
    fontWeight: 'bold',
  },

  paperShadow: {
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
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
  floatLeft: {
    float: 'left'
  },
  floatRight: {
    float: 'right'
  }

}));

export default function OnlineUsers({ socket, onlineUserList }) {
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
      // console.log("v");
      setOnlineUserListCopy(onlineUserListCopy.slice().filter(user => user.Name.toLowerCase().includes(searchString.toLowerCase())))
    } else {
      setOnlineUserListCopy(onlineUserList);
    }
  }, [searchString, onlineUserList, setOnlineUserListCopy]); // 2nd dependency help make sure new client connects will not make filtered list wrong


  return (
    <>
      {open ?
        <div className={`${classes.list} ${classes.paperShadow}`}>
          <div className={classes.drawerHeader}>
            <Input
              placeholder="Username here"
              onChange={(event) => { setSearchString(event.target.value) }}
              fullWidth
              style={{ position: 'sticky' }}
            />
            <IconButton onClick={handleDrawerClose}>
              <MinimizeIcon />
            </IconButton>
          </div>
          <List >
            {onlineUserListCopy.length === 0 ?
              <div >No user found</div>
              :
              onlineUserListCopy.map((item) => (
                <ListItem key={item.ID}>
                  <ListItemIcon >
                    <StyledBadge badgeContent={""} >
                      <FaceIcon fontSize="large" />
                    </StyledBadge>
                  </ListItemIcon>
                  <ListItemText primary={item.Name} />
                  {/* <Button variant="outlined" style={{ fontSize: '12px', borderRadius: '5px', padding: '2px' }}>Invite</Button> */}
                </ListItem>
              ))}
          </List>
        </div>
        :
        <div className={`${classes.card} ${classes.paperShadow}`} onClick={() => handleDrawerOpen()}>
          <div className={classes.floatLeft}>
            Online Users
          </div>
          <div className={classes.floatRight} style={{ marginRight: '10px' }}>
            <Badge badgeContent={onlineUserList.length} color="secondary" />
          </div>
        </div>
      }

    </>

  );
}
