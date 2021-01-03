import React, { useEffect } from 'react';
import { Link, useHistory } from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import { authen } from '../../utils/helper';
import background from '../../images/background.jpg';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
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
  }, []);

  const container = {
    position: 'relative',
    marginBottom: '150px'
  }

  const boxShadow = {
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
  }

  const homeBackground = {
    marginTop: '-23px',
    borderRadius: '0 0 0 200%',
    borderTopWidth: '0',
    width: '100%',
    height: '85%',
    boxShadow: boxShadow.boxShadow
  }

  const managementContent = {
    fontSize: '1.5vw',
    fontWeight: 'bold',
    color: 'white',
    display: 'table-cell',
    verticalAlign: 'middle',
    textAlign: 'left'
  }

  return (
    <div style={container}>
      <img src={background} style={homeBackground} alt="Home background" />
      <Typography style={{
        position: 'absolute', left: '35%', top: '40%', fontSize: '5vw', color: 'white', fontWeight: 'bolder',
        boxShadow: boxShadow.boxShadow
      }}
      >
        Home page for our Admin
      </Typography>

      <Link to='/users'>
        <div style={{
          position: 'absolute', left: 0, top: '70%', width: '18vw', minHeight: '3.5vw', paddingLeft: '20px',
          borderRadius: '0 5px 5px 0', backgroundColor: '#f6a00f', display: 'table', boxShadow: boxShadow.boxShadow
        }}>
          <Typography style={managementContent}>User management <ArrowForwardIcon style={{ verticalAlign: 'middle' }} /></Typography>
        </div>
      </Link>
      <Link to='/games'>
        <div style={{
          position: 'absolute', left: 0, top: '85%', width: '20vw', minHeight: '3.5vw', paddingLeft: '20px',
          borderRadius: '0 5px 5px 0', backgroundColor: '#2f8fe6', display: 'table', boxShadow: boxShadow.boxShadow
        }}>
          <Typography style={managementContent}>Game management <ArrowForwardIcon style={{ verticalAlign: 'middle' }} /></Typography>
        </div>
      </Link>
    </div>
  );
}

export default Home;
