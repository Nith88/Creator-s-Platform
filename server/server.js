import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js'; 

import { createServer } from 'http';
import { Server } from 'socket.io';


// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Middleware
// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

io.use((socket, next) => {
  const origin = socket.handshake.headers.origin;
  if (origin === process.env.CLIENT_URL || origin === 'http://localhost:5173') {
    return next();
  } else {
    return next(new Error('CORS error: Origin not allowed'));
  }   
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.id} (${reason})`);
  });
});


app.use(express.json());
// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Health check endpoint (keep this for testing)
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date(),
    database: 'Connected'
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
});