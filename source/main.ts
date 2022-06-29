import { createServer } from "http";
import { stringify } from "querystring";
import { Server } from 'socket.io';
import { State } from "./state";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

const state = new State();

io.on('connection', socket => {
    socket.join('qrtag');

    socket.on('announceGun', (data: { id: string }) => {
        state.addTagger(data.id, socket.id);
        socket.broadcast.emit('gunAnnounced', data);
    });

    socket.on('startSetup', () => {
        state.startSetup();
        socket.broadcast.emit('setupStarted');
    });


    socket.on('addUser', (data: { gunId: string, username: string }) => {
        state.addUser({
            username: data.username,
            taggerId: data.gunId
        });
        socket.broadcast.emit('userAdded', data);
    });

    socket.on('bindTshirt', (data: { gunId: string, tshirtId: string }) => {
        const user = state.bindTshirt(data.gunId, data.tshirtId);
        socket.broadcast.emit('tshirtBound', { username: user.username, tshirtId: data.tshirtId });
    });

    socket.on('tag', (data: { whoDidIt: string, tshirtId: string }) => {
        const taggedUser = state.tag(data.tshirtId);

        socket.broadcast.emit('userTagged', {
            whoDidIt: data.whoDidIt,
            username: taggedUser.username
        });

        if (taggedUser.life === 0) {
            socket.broadcast.emit('userDied', {
                username: taggedUser.username
            });
        }

        if (state.getAliveUsersCount() <= 1) {
            socket.broadcast.emit('gameFinished');
        }
    });
});

httpServer.listen(3000);
