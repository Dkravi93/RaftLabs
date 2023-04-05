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
import User from './src/models/userModels';
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server);


// Middleware for authentication
const authMiddleware = async (socket: Socket, next: any) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded: any = jwt.verify(token, jwtSecret);
    // @ts-ignore
    socket.handshake.userId = decoded.userId;
    const recipient = await User.findById(decoded.userId);
    // @ts-ignore
    socket.handshake.recipientId = recipient._id;
    next();
  } catch (err) {
    return next(new Error('Authentication error'));
  }
};

io.use(authMiddleware);

io.on('connection', (socket: Socket) => {
  // @ts-ignore
  console.log(`User ${socket.handshake.userId} connected`);

  socket.on('disconnect', () => {
    // @ts-ignore
    console.log(`User ${socket.handshake.userId} disconnected`);
  });

  socket.on('join', (room: string) => {
    socket.join(room);
  });

  socket.on('chat', (data: any) => {
    const message = {
      // @ts-ignore
      from: socket.handshake.userId,
      text: data.text,
    };
    io.emit('chat', message);
  });

  socket.on('privateChat', async (data: any) => {
    const message = {
      // @ts-ignore
      from: socket.handshake.userId,
      text: data.text,
    };
    const to = data.to;
    if (to) {
      const recipient = await User.findById(to);
      if (!recipient) {
        return socket.emit('errorMessage', 'User not found');
      }

      socket.emit('join', to);
      // @ts-ignore
      io.to(recipient._id).emit('privateChat', message);
    } else {
      socket.emit('error', 'Invalid recipient');
    }
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
