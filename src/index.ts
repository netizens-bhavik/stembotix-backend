import { Server } from 'socket.io';
import type { Server as httpServer } from 'http';

let users = [];
const initEvents = (io: Server) => {
  io.on('connect', (socket) => {
    console.log('⚡:user just connected!');
    socket.on('message', (data) => {
      io.emit('messageResponse', data);
    });
    socket.on('typing', (data) =>
      socket.broadcast.emit('typingResponse', data)
    );

    socket.on('newUser', (data) => {
      users.push(data);
      io.emit('newUserResponse', users);
    });

    socket.on('disconnect', () => {
      console.log('🔥: user just disconnected');
      users = users.filter((user) => user.socketID !== socket.id);
      io.emit('newUserResponse', users);
      socket.disconnect();
    });
  });
};

const init = (server: httpServer) => {
  const io = new Server(server, {
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

// const express = require("express")
// const app = express()
// const cors = require("cors")
// const http = require('http').Server(app);
// const PORT = 4000
// const socketIO = require('socket.io')(http, {
//     cors: {
//         origin: "http://localhost:3000"
//     }
// });

// app.use(cors())

// socketIO.on('connection', (socket) => {
//     console.log(`⚡: ${socket.id} user just connected!`)
//     socket.on("message", data => {
//       socketIO.emit("messageResponse", data)
//     })

//     socket.on("typing", data => (
//       socket.broadcast.emit("typingResponse", data)
//     ))

//     socket.on("newUser", data => {
//       users.push(data)
//       socketIO.emit("newUserResponse", users)
//     })

//     socket.on('disconnect', () => {
//       console.log('🔥: A user disconnected');
//       users = users.filter(user => user.socketID !== socket.id)
//       socketIO.emit("newUserResponse", users)
//       socket.disconnect()
//     });
// });
