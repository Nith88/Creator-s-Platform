import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import connectDB from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';

import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing');
}

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

/* 🔐 SOCKET AUTH */
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.data.user = decoded;

    next();
  } catch (err) {
    return next(new Error(`Authentication error: ${err.message}`));
  }
});

/* 🔌 SOCKET CONNECTION */
io.on('connection', (socket) => {
  const userId = socket.data.user.id || socket.data.user._id;

  socket.join(userId);

  console.log(
    `✅ User connected: ${socket.id} | User: ${socket.data.user.email}`
  );

  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.id} (${reason})`);
  });
});

/* 🌐 EXPRESS */
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

/* ✅ Attach io globally */
app.use((req, res, next) => {
  req.io = io;
  next();
});

/* 🚀 ROUTES */
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

/* ❤️ HEALTH */
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Server is running!',
    timestamp: new Date(),
    database: 'Connected'
  });
});

/* 🚀 START */
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready`);
});