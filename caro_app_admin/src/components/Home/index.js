import React, { useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import { authen } from '../../utils/helper';
import background from '../../images/background.jpg';

function Home() {
  const history = useHistory();

  useEffect(() => {
    async function Authen() {
      const status = await authen();
      if (status === 401) {
        history.push('/signIn');
      }
    }
    Authen();
  });

  const homeBackground = {
    marginTop: '-23px',
    borderRadius: '0 0 0 200%',
    // border: '1px solid grey',
    borderTopWidth: '0',
    width: '100%',
    height: '85%',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
  }

  return (
    <div style={{ position: 'relative' }}>
      <img src={background} style={homeBackground} alt="Home background" />
      <Typography style={{
        position: 'absolute', left: '30%', top: '40%', fontSize: '70px', color: 'white', fontWeight: 'bolder', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
      }}>Home page for our Admin</Typography>

    </div>
  );
}

export default Home;
