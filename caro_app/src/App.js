import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import Games from './components/GameList/games';
import Game from './components/Game/game';
import Home from './components/Home/home';
import SignIn from './components/SignIn/signin';
import Profile from './components/Profile/profile';
import SignUp from './components/SignUp/signup';
import Navbar from './components/Navbar/navbar';
import Footer from './components/Footer/footer';
import ActiveDestination from './components/ActiveDestination/activeDestination';
import PlayedGame from './components/PlayedGame/playedGame';
import InvitationDialog from './components/Dialogs/InvitationDiallog/index';
import ResetDestination from './components/ResetDetination/resetDestination';
import UserDetail from './components/UserDetail/userDetail';
import './App.css';
import socketIOClient from "socket.io-client";
import config from './constants/config.json';
const API_URL = config.API_URL_TEST;

const socket = socketIOClient(API_URL, { query: `userID=${window.localStorage.getItem('userID')}` });

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('userID') !== null);
  const [onlineUserList, setOnlineUserList] = useState([]);

  useEffect(() => {
    socket.on("server_RefreshList", list => {
      setOnlineUserList(list);
    });
  }, [setOnlineUserList]);

  return (
    <Router>
      <Navbar socket={socket} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <InvitationDialog socket={socket} />
      <br />
      <div className="App">
        <Switch>
          <Route path='/' exact>
            <Home socket={socket} onlineUserList={onlineUserList} />
          </Route>
          <Route path='/signin'>
            <SignIn socket={socket} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          </Route>
          <Route path='/signup'>
            <SignUp socket={socket} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          </Route>
          <Route path='/active/:id'>
            <ActiveDestination socket={socket} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          </Route>
          <Route path='/reset/:id'>
            <ResetDestination isLoggedIn={isLoggedIn} />
          </Route>
          <Route path='/profile'>
            <Profile />
          </Route>
          <Route exact path='/games'>
            <Games socket={socket} />
          </Route>
          <Route path='/games/:gameID'>
            <Game socket={socket} onlineUserList={onlineUserList} />
          </Route>
          <Route path='/playedGame/:id'>
            <PlayedGame />
          </Route>
          <Route path='/userDetail/:id'>
            <UserDetail />
          </Route>
        </Switch>
      </div>
      <br></br>
      <Footer />
    </Router>
  );
}

export default App;
