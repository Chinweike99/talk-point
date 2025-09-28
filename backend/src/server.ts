import cors from 'cors'
import express from 'express';
import { Server as SocketIOServe } from 'socket.io';
import { createServer } from 'http';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectRabbitMQ } from './services/rabbitmq';

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

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
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

