import React from 'react';
import OnlineUser from '../OnlineUsers/onlineUsers_Primary';
import background from '../../images/background.jpg';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';

const homeBackground = {
  marginTop: '-20px',
  borderRadius: '0 0 0 200%',
  // border: '1px solid grey',
  borderTopWidth: '0',
  width: '100%',
  boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
}

function Home({ onlineUserList, socket }) {
  const history = useHistory();

  const handleGetStarted = () => {
    history.push("/games");
  }
  return (
    <div style={{ position: 'relative' }}>
      <img src={background} style={homeBackground} />
      <div>
        <OnlineUsers onlineUserList={onlineUserList} />
      </div>
      <div style={{ position: 'absolute', left: '10%', bottom: '15%' }}>
        <Button variant="outlined" color="secondary" onClick={handleGetStarted}>
          Get started
        </Button>
      </div>


    </div>

  );
}
export default Home;