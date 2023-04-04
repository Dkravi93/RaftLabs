import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
const jwt = require('jsonwebtoken');
import User from '../models/userModels';
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET_KEY;


const authMiddleware = (socket: any, next: (err?: any) => void) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: string };
    socket.userId = decoded.id;
    next();
  } catch (err) {
    return next(new Error('Authentication error'));
  }
};

export function startSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: '*'
    }
  });
  // Handle WebSocket connections
  io.on('connection', (socket: any) => {
    console.log('A user connected');
    io.use(authMiddleware);
  
    // Handle disconnections
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  
    // Handle joining a private room
    socket.on('chat', (data: { to?: string, text: string }) => {
      // ts-ignore
      const message = {
        from: socket.userId,
        text: data.text,
      };
      if (data.to) {
        // Send to specific user
        io.to(data.to).emit('chat', message);
      } else {
        // Broadcast to all users
        socket.broadcast.emit('chat', message);
      }
    });

  });

  return io;
}
