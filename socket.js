let io;
let sockets = [];

let googleSockets = [];

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer, {cors: {origin: "*"}});
        return io;
    },
    getIO: () => {
        //if(!io) {
       //     throw new Error("socket io not initialized")
        //}
        return io;
    },
    getSockets: () => {
        return sockets;
    },

    googleSockets: () => {
        return googleSockets;
    }
}