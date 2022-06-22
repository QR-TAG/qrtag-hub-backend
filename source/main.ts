import { createServer } from "http";
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

io.on('connection', socket => {
    socket.data.guns = [];

    socket.on('startGame', () => {
        socket.emit('gameStarted', socket.data.guns);
    });

    socket.on('announceGun', (data: { id: string }) => {
        socket.data.guns.push(data.id);
        console.log(socket.data.guns);
    });
});

httpServer.listen(3000);