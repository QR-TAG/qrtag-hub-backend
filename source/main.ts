import { createServer } from "http";
import { Server } from 'socket.io';

import logger from 'euberlog';

import { State } from "./state";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

const state = new State();

io.on('connection', socket => {
    logger.info('new connection', socket.id);

    socket.on('announceGun', (data: { id: string }) => {
        logger.debug('announceGun', data);

        state.addTagger(data.id, socket.id);
        socket.broadcast.emit('gunAnnounced', data);
    });

    socket.on('startSetup', () => {
        logger.debug('startSetup');

        state.startSetup();
        socket.broadcast.emit('setupStarted');
    });


    socket.on('addUser', (data: { gunId: string, username: string }) => {
        logger.debug('addUser', data);

        state.addUser({
            username: data.username,
            taggerId: data.gunId
        });
        socket.broadcast.emit('userAdded', data);
    });

    socket.on('bindTshirt', (data: { gunId: string, tshirtId: string }) => {
        logger.debug('bindTshirt', data);

        const user = state.bindTshirt(data.gunId, data.tshirtId);
        socket.broadcast.emit('tshirtBound', { username: user.username, tshirtId: data.tshirtId });
    });

    socket.on('tag', (data: { whoDidIt: string, tshirtId: string }) => {
        logger.debug('tag', data);
        
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
