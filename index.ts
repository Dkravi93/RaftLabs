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
    if (!decoded || !decoded.userId) {
      throw new Error('Invalid token');
    }
    
    if (decoded.userId === '') {
      throw new Error('Invalid userId');
    }
    // @ts-ignore
    socket.handshake.userId = decoded.userId;
    const filter = { _id: decoded.userId };
    const update = { socketId: socket.id };
    const options = { new: true };
    const recipient = await User.findOneAndUpdate(filter, update, options);
    console.log("TTTTTTTT", recipient);
    
    // @ts-ignore
    socket.handshake.userId = recipient._id;
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

  socket.on('chat', async (data: any, room: any) => {
    try {
      const message = {
        // @ts-ignore
        from: socket.handshake.userId,
        text: data.text,
      };

      if (room === "") {
        // Broadcast message to all clients
        socket.broadcast.emit('send-message', message);
      } else {
        const recipient = await User.findById(room);
        if (!recipient) {
          throw new Error('Recipient not found');
        }
        // Send message to specific client
        // @ts-ignore
        socket.to(recipient.socketId).emit('send-message', message);
      }
    } catch (err) {
      console.error(err);
      throw err; // Rethrow the error
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
