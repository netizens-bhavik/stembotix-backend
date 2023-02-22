import { Server } from 'socket.io';
import type { Server as httpServer } from 'http';
import { writeFile } from 'fs';

let users = [];
const initEvents = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`⚡: user just connected!`);
    // */${socket.id}
    socket.on('get-data', (data) => console.log('data', data));
    socket.on('join', (roomId) => {
      const selectedRoom = io.sockets.adapter.rooms[roomId];
      const numberOfClients = selectedRoom ? selectedRoom.length : 0;

      if (numberOfClients == 0) {
        console.log(`Creating room ${roomId} `);
        socket.join(roomId);
        socket.emit('room_created', roomId);
      } else if (numberOfClients >= 1) {
        console.log(`Joining room ${roomId}  `);
        socket.join(roomId);
        socket.emit('room_joined', roomId);
      }
    });
    socket.on('message', (data) => {
      io.emit('messageResponse', data);
    });
    socket.on('typing', (data) =>
      socket.broadcast.emit('typingResponse', data)
    );
    socket.on('upload', (file, callback) => {
      console.log(file);

      writeFile('/tmp/upload', file, (err) => {
        callback({ message: err ? 'failure' : 'success' });
      });
      socket.on('newUser', (data) => {
        users.push(data);
        io.emit('newUserResponse', users);
      });

      socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');
      });
    });
  });
};

const init = (server: httpServer) => {
  const io = new Server(server, {
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
    cors: {
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });
  initEvents(io);
  return io;
};

export default init;
