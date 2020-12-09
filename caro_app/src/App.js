import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';
import { useState } from 'react';
import Games from './components/GameList/games';
import Game from './components/Game/game';
import Home from './components/Home/home';
import SignIn from './components/SignIn/signin';
import Profile from './components/Profile/profile';
import SignUp from './components/SignUp/signup';
import Navbar from './components/Navbar/navbar';
import Footer from './components/Footer/footer';
import './App.css';
import socketIOClient from "socket.io-client";

const socket = socketIOClient("http://localhost:8000", { query: `userID=${window.localStorage.getItem('userID')}` });

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('userID') !== null);
  return (
    <Router>
      <Navbar socket={socket} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <br></br>
      <div className="App">
        <Switch>
          <Route path='/' exact>
            <Home />
          </Route>
          <Route path='/profile'>
            <Profile />
          </Route>
          <Route path='/signin'>
            <SignIn socket={socket} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          </Route>
          <Route exact path='/games'>
            <Games />
          </Route>
          <Route path='/games/:gameID'>
            <Game socket={socket} />
          </Route>
          <Route path='/signup'>
            <SignUp socket={socket} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          </Route>
        </Switch>
      </div>
      <br></br>
      <Footer />
    </Router>
  );
}

export default App;
