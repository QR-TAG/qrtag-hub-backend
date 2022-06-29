const { io } = require("socket.io-client");
const socket = io('http://localhost:3000');
socket.broadcast.emit('announceGun', { id: 'diocan'});
// socket.broadcast('announceTshirt', { gunId: '001', tshirtId: 'abcd' });


