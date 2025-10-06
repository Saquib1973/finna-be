import { Socket, Server as SocketIOServer } from 'socket.io';
// Function to register user-related socket events
export function registerUserEvents(io, socket) {
    socket.on('someUserEvent', (data) => {
        // Handle the event
        console.log('Received someUserEvent with data:', data);
        // You can emit responses or broadcast to other sockets as needed
        socket.emit('someUserEventResponse', { msg: 'Event received!' });
    });
}
//# sourceMappingURL=userEvents.js.map