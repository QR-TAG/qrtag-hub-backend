const { io } = require("socket.io-client");
const socket = io('http://localhost:3000');

function announceTaggers() {
    socket.emit('announceTagger', { id: '001' });
    socket.emit('announceTagger', { id: '002' });
}
// announceTaggers();

function bindTshirt() {
    socket.emit('bindTshirt', { taggerId: '001', tshirtId: 'abcd' });
    socket.emit('bindTshirt', { taggerId: '002', tshirtId: 'efgh' });
}
// bindTshirt();

function tag() {
    socket.emit('tag', { whoDidIt: 'pippo', tshirtId: 'efgh' });
    socket.emit('tag', { whoDidIt: 'pippo', tshirtId: 'efgh' });
}
tag();