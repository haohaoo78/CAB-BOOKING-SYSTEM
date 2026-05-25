const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const redis = require('redis');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const logger = require('../../shared/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { metricsMiddleware, register } = require('../../shared/metrics');
const { tracingMiddleware } = require('../../shared/tracing');
const { getEventBus } = require('../../shared/eventBus');
const locationRoutes = require('./routes/location.routes');
const socketHandler = require('./socket/socket.handler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3006;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Observability middleware
app.use(tracingMiddleware);
app.use(metricsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'location-service', timestamp: new Date() });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api/location', locationRoutes);
app.use(errorHandler);

// Redis client for location caching
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379
  }
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.connect().then(() => {
  logger.info('Redis connected successfully');
});

// Set redis client for controllers
const locationController = require('./controllers/location.controller');
locationController.setRedisClient(redisClient);

// Socket.io connection handler
io.on('connection', (socket) => socketHandler(io, socket, redisClient));

// Initialize Event Bus
async function initializeEventBus() {
  try {
    const eventBus = getEventBus();
    await eventBus.connect();
    logger.info('Event Bus connected successfully');
  } catch (error) {
    logger.error('Failed to initialize Event Bus:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cab_booking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  logger.info('MongoDB connected successfully');
  
  // Initialize Event Bus
  await initializeEventBus();
  
  server.listen(PORT, () => {
    logger.info(`Location Service running on port ${PORT}`);
  });
})
.catch((error) => {
  logger.error('MongoDB connection error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  const eventBus = getEventBus();
  await eventBus.close();
  await redisClient.quit();
  mongoose.connection.close();
  process.exit(0);
});

module.exports = { app, io };
