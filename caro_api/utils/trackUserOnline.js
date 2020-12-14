module.exports = {
    addClientToMap: (userSocketIdMap, userID, socketID) => {
        if (userSocketIdMap.has(userID) === false) {
            //when user is joining first time
            userSocketIdMap.set(userID, new Set([socketID]));
            console.log(userSocketIdMap);
            return 1;
        }
        else {
            //user had already joined from one client and now joining using another
            // client
            userSocketIdMap.get(userID).add(socketID);
            console.log(userSocketIdMap);
            return 0;
        }
    },

    removeClientFromMap: (userSocketIdMap, userID, socketId) => {
        if (userSocketIdMap.has(userID)) {
            let userSocketIdSet = userSocketIdMap.get(userID);
            userSocketIdSet.delete(socketId);
            console.log(userSocketIdMap);
            return 0;
        }
        //if there are no clients for a user, remove that user from online
        //list (map)
        if (userSocketIdSet.size === 0) {
            userSocketIdMap.delete(userID);
            console.log(userSocketIdMap);
            return 1;
        }

    },

    removeClientFromMap: (userSocketIdMap, userID, socketId) => {
        if (userSocketIdMap.has(userID)) {
            let userSocketIdSet = userSocketIdMap.get(userID);
            userSocketIdSet.delete(socketId);

            //if there are no clients for a user, remove that user from online list(map)
            if (userSocketIdSet.size == 0) {
                userSocketIdMap.delete(userID);// log out and no other devices
                console.log(userSocketIdMap);
                return 1;
            }
            console.log(userSocketIdMap);
            return 0; // log out and other devices still online
        }
    }
}