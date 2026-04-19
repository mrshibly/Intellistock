import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export const initSockets = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join', (orgId) => {
      socket.join(orgId);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};
