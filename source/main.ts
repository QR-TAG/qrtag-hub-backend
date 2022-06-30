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

    io.sockets.emit('state', state.getState());

    socket.on('announceTagger', (data: { id: string }) => {
        logger.debug('announceTagger', data);

        state.addTagger(data.id, socket.id);
        io.sockets.emit('taggerAnnounced', data);
    });

    socket.on('startSetup', () => {
        logger.debug('startSetup');

        state.startSetup();
        io.sockets.emit('setupStarted');
    });

    socket.on('addUser', (data: { taggerId: string, username: string }) => {
        logger.debug('addUser', data);

        const user = state.addUser({
            username: data.username,
            taggerId: data.taggerId
        });

        io.sockets.emit('userAdded', user);
    });

    socket.on('bindTshirt', (data: { taggerId: string, tshirtId: string }) => {
        logger.debug('bindTshirt', data);

        const user = state.bindTshirt(data.taggerId, data.tshirtId);
        logger.debug('user', user);
        io.sockets.emit('tshirtBound', { username: user.username, tshirtId: data.tshirtId });
    });

    socket.on('startGame', () => {
        logger.debug('startGame');

        state.startGame();
        io.sockets.emit('gameStarted');
    });

    socket.on('tag', (data: { whoDidIt: string, tshirtId: string }) => {
        logger.debug('tag', data);

        const taggedUser = state.tag(data.tshirtId);

        io.sockets.emit('userTagged', {
            whoDidIt: data.whoDidIt,
            username: taggedUser.username
        });

        if (taggedUser.life === 0) {
            io.sockets.emit('userDied', {
                username: taggedUser.username
            });
        }

        if (state.getAliveUsersCount() <= 1) {
            io.sockets.emit('gameFinished');
            logger.debug('game finished');
        }
    });

    socket.on('disconnect', () => {
        logger.info('disconnect', socket.id);

        const taggerId = state.removeTaggerFromSocketId(socket.id);

        if (taggerId) {
            io.sockets.emit('taggerDisconnected', {
                taggerId
            });
        }
    });
});

httpServer.listen(3000);
