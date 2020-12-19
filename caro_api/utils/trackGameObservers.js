module.exports = {

  //map -> key      ,     value
  //        gameID          map ->  key    ,    value
  //                                userID        count  (>= 1: watching game; downto 0: dont watch anymore so remove out of map)                    

  removeObserverFromMap: (observerOfAGame, gameID, userID) => {

    if (observerOfAGame.has(gameID)) {

      const observerCount = observerOfAGame.get(gameID);

      if (observerCount.has(userID)) {

        const count = observerCount.get(userID) - 1;

        if (count >= 1) // người đó vẫn còn ít nhất 1 device quan sát game
        {
          observerCount.set(userID, count);
          return 0;

        } else { // == 0; người đó ko còn quan sát game này bằng thiết bị nào cả

          observerCount.delete(userID);

          if (observerCount.size === 0) {

            observerOfAGame.delete(gameID);

          }
          return 1;
        }
      } else {

        return 0;

      }
    }
  },

  addObserverToMap: (observerOfAGame, gameID, userID) => {

    if (observerOfAGame.has(gameID) === false) {// game mới có người đầu tiên vào xem

      const observerCount = new Map();
      observerCount.set(userID, 1);

      observerOfAGame.set(gameID, observerCount);
      return 1;
    }
    else {

      const observerCount = observerOfAGame.get(gameID);
      if (observerCount.has(userID)) {

        const count = observerCount.get(userID) + 1;
        observerCount.set(userID, count);
        return 0;

      } else {
        observerCount.set(userID, 1);
        return 1;
      }
    }
  },




}