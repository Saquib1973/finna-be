import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { registerUserEvents } from './userEvents.js';
dotenv.config();
export function initSocket(server) {
    const io = new SocketIOServer(server, {
        cors: {
            origin: '*',
        },
    }); // socket io server instance
    //auth middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return next(new Error('Authentication error'));
            }
            let userData = decoded.user;
            socket.data = userData;
            socket.data.userId = userData.id;
            next();
        });
        io.on('connection', (socket) => {
            const userId = socket.data.userId;
            console.log(`User connected: ${userId}, username: ${socket.data.username}`);
            //register events
            registerUserEvents(io, socket);
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${userId}`);
            });
        });
    });
    return io;
}
//# sourceMappingURL=socket.js.map