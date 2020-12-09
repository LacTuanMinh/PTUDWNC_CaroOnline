import {useState} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';
import Home from './components/Home/index';
import SignIn from './components/SignIn/index';
import Profile from './components/Profile/index';
import Navbar from './components/Navbar/index';
import Footer from './components/Footer/index'
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('userID') !== null);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
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
            <SignIn isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
          </Route>
          {/* <Route exact path='/games'>
            <Games />
          </Route>
          <Route path='/games/:gameID'>
            <Game />
          </Route> */}
        </Switch>
      </div>
      <br></br>
      <Footer />
    </Router>
  );
}

export default App;
