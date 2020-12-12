import React from 'react';
import OnlineUser from '../OnlineUsers/onlineUsers_Primary'

function Home({ onlineUserList, socket }) {
  return (
    <>
      <div>HOME</div>
      <div>
        <OnlineUser socket={socket} onlineUserList={onlineUserList} />
      </div>

    </>

  );
}

export default Home;