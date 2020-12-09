import React, { useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import { authen } from '../../utils/helper';

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


  return (
    <Typography>Home page for our Admin</Typography>
  );
}

export default Home;