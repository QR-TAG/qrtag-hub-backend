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
    socket.data.users = [];

    socket.on('startSetup', () => {
        socket.emit('setupStarted', socket.data.guns);
    });

    socket.on('announceGun', (data: { id: string }) => {
        socket.data.guns.push(data.id);
        console.log(socket.data.guns);
    });

    socket.on('addUser', (data: { gunId: string, username: string }) => {
        socket.data.users.push({
            gunId: data.gunId,
            username: data.username,
            tshirtId: null,
            life: 5
        });
    });

    socket.on('announceTshirt', (data: { gunId: string, tshirtId: string }) => {
        socket.data.users = socket.data.users.map((user: any) => {
            if (user.gunId === data.gunId) {
                user.tshirtId = data.tshirtId;
            }
            return user;
        });
    });

    socket.on('tshirtShot', (data: { shooterGunId: string, tshirtId: string }) => {
        const user = socket.data.users.find((user: any) => user.tshirtId === data.tshirtId);
        if (user) {
            user.life--;
        }
    });

    socket.on('startGame', () => {

    });

});

httpServer.listen(3000);