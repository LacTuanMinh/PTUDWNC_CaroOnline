import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';
import Home from './Components/Home/index';
import Login from './Components/Login/index';
import Profile from './Components/Profile/index';
import Navbar from './Components/Navbar/index';
import Footer from './Components/Footer/index'
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
