import { Server } from 'socket.io';
import type { Server as httpServer } from 'http';
import path from 'path';
import fs from 'fs';
import { API_BASE } from '@/config';

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
    socket.on('upload', (file) => {
      const folderpath = path.resolve(__dirname, '../public/chatImage');
      fs.mkdirSync(folderpath, { recursive: true });
      const fileType = file.type.split('/');
      const fileName = `chat-${Date.now()}.${fileType[1]}`;
      if (fs.existsSync(folderpath)) {
        fs.writeFile(`${folderpath}/${fileName}`, file.file, (err) => {});
        const filePath = `${API_BASE}/media/chatImage/${fileName}`;

      }
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
    maxHttpBufferSize: 10e6,
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
