import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import { authen } from '../../Utils/helper';

function Home() {
  const history = useHistory();

  useEffect(() => {
    async function Authen() {
      const status = await authen();
      if (status === 401) {
        history.push('/login')
      }
    }
    Authen();
  });


  return (
    <Typography>Home page for our Admin</Typography>
  );
}

export default Home;