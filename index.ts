import express from 'express';
import http from 'http';
import connectDB from './src/config/db';
import router from './src/routes/userRoutes';
import { Server, Socket } from 'socket.io';
require('dotenv').config();
import cors from 'cors';
import path from 'path';
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET_KEY;

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server);


// Middleware for authentication
const authMiddleware = (socket: any, next: any) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded: any = jwt.verify(token, jwtSecret);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    return next(new Error('Authentication error'));
  }
};

io.use(authMiddleware);

io.on('connection', (socket: any) => {
  console.log(`User ${socket.userId} connected`);

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });

  socket.on('join', (room: string) => {
    socket.join(room);
  });

  socket.on('chat', (data: any) => {
    const message = {
      from: socket.id,
      text: data.text,
    };
      io.emit('chat', message);
    
  });
  socket.on('privateChat', (data: any) => {
    const message = {
      from: socket.id,
      text: data.text,
    };
    io.to(data.to).emit('privateChat', message);
  });
});
app.get('/chat-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/chat.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
})

app.use(express.json());
app.use('/api', router);

server.listen(3000, () => {
  connectDB();
  console.log('Server listening on port 3000');
});
