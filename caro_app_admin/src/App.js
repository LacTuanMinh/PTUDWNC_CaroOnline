import { useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';
import Home from './components/Home/index';
import SignIn from './components/SignIn/index';
import Profile from './components/Profile/index';
import Navbar from './components/Navbar/index';
import Footer from './components/Footer/index';
import UserManagement from './components/UserManagement/index';
import UserDetail from './components/UserDetail/index';
import GameManagement from './components/GameManagement/index';
import PlayedGame from './components/PlayedGame/index';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('userID') !== null);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <br></br>
      <div className="App">
        <Switch>
          <Route path='/' exact>
            <Home />
          </Route>
          <Route path='/profile'>
            <Profile />
          </Route>
          <Route path='/signIn'>
            <SignIn isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          </Route>
          {/* users này là người chơi, không phải admin */}
          <Route exact path='/users'>
            <UserManagement />
          </Route>
          {/* userID: id của người chơi, không phải của admin */}
          <Route exact path='/users/:userID'>
            <UserDetail />
          </Route>
          <Route exact path='/games'>
            <GameManagement />
          </Route>
          <Route exact path='/games/:gameID'>
            <PlayedGame />
          </Route>
        </Switch>
      </div>
      <br></br>
      <Footer />
    </Router>
  );
}

export default App;
