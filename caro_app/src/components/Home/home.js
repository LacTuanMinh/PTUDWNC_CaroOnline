import React from 'react';
import OnlineUsers from '../OnlineUsers/onlineUsers_Primary'

function Home({ onlineUserList, socket }) {
  return (
    <>
      <div>HOME</div>
      <div>
        <OnlineUsers onlineUserList={onlineUserList} />
      </div>

    </>

  );
}

export default Home;