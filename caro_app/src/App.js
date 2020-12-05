import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import Games from './components/GameList/games';
import Game from './components/Game/game';
import Home from './components/Home/home';
import Login from './components/Login/login';
import Profile from './components/Profile/profile';
import SignUp from './components/SignUp/signup';
import Navbar from './components/Navbar/navbar';
import Footer from './components/Footer/footer';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <br></br>
      <div className="App">
        <Switch>
          <Route path='/' exact>
            <Home />
          </Route>
          <Route path='/profile'>
            <Profile />
          </Route>
          <Route path='/login'>
            <Login />
          </Route>
          <Route exact path='/games'>
            <Games />
          </Route>
          <Route path='/games/:gameID'>
            <Game />
          </Route>
          <Route path='/signup'>
            <SignUp />
          </Route>
        </Switch>
      </div>
      <br></br>
      <Footer />
    </Router>
  );
}

export default App;
