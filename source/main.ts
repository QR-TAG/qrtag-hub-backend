import { createServer } from "http";
import { Server } from 'socket.io'; 

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

let guns: any[] = [];
let users: any[] = [];

io.on('connection', socket => {
   

    socket.on('startSetup', () => {
        socket.emit('setupStarted', guns);
        console.log(guns);
    });

    socket.on('announceGun', (data: { id: string }) => {
        guns.push(data.id);
        console.log(data);
    });

    socket.on('addUser', (data: { gunId: string, username: string }) => {
        users.push({
            gunId: data.gunId,
            username: data.username,
            tshirtId: null,
            life: 5
        });
    });

    socket.on('announceTshirt', (data: { gunId: string, tshirtId: string }) => {
        users = users.map((user: any) => {
            if (user.gunId === data.gunId) {
                user.tshirtId = data.tshirtId;
            }
            return user;
        });
    });

    socket.on('tshirtShot', (data: { shooterGunId: string, tshirtId: string }) => {
        const user = users.find((user: any) => user.tshirtId === data.tshirtId);
        if (user) {
            user.life--;
        }

        console.log(users.reduce((acc: any, curr: any) => acc + (curr.life > 0 ? 1 : 0), 0));
        if (users.reduce((acc: any, curr: any) => acc + (curr.life > 0 ? 1 : 0), 0) <= 1) {
            socket.emit('gameFinished');
        }
    });
});

httpServer.listen(3000);
