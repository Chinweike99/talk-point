import cors from 'cors'
import express from 'express';
import { Server as SocketIOServe } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectRabbitMQ } from './services/rabbitmq';
import fs from 'fs';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import roomRoutes from './routes/rooms';
import messageRoutes from './routes/messages';
import { setupSocketIO } from './sockets/chats';

import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';
import reactionRoutes from './routes/messageReactions';
import { setupNotificationConsumer } from './services/notification';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const app = express();
const server = createServer(app);
const io = new SocketIOServe(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})


// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reactions', reactionRoutes);
// app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


// setup

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Notification consumer setup
    setupNotificationConsumer();

    // Setup Socket.IO after RabbitMQ connection
    setupSocketIO(io);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`💬 Socket.IO ready for connections`);
      console.log(`🐰 RabbitMQ connected and consumers running`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

