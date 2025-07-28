const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Import middleware
const cookieParser = require('cookie-parser');
const { requireAuth } = require('./middleware/authMiddleware');

// Import route modules
const authRoutes = require('./routes/authentication');
const tripsRoutes = require('./routes/trips');
const questionsRoutes = require('./routes/questions');
const storyRoutes = require('./routes/Story');
const replyRoutes = require('./routes/reply');
const tripReplyRoutes = require('./routes/tripReply');
const reviewsRoutes = require('./routes/reviews');
const reactionRoutes = require('./routes/reactions');
const favoriteRoutes = require('./routes/favorie');
const userManagementRoutes = require('./routes/userManagement');
const searchRoutes = require('./routes/search');

const app = express();

// Global middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Serve uploaded files
app.use(cookieParser());

// CORS middleware (add if needed for frontend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API Routes
app.use('/api/v1', [
  // Authentication routes
  authRoutes,

  // Content management routes
  tripsRoutes,
  questionsRoutes,
  storyRoutes,

  // Interaction routes
  replyRoutes,
  tripReplyRoutes,
  reviewsRoutes,
  reactionRoutes,
  favoriteRoutes,

  // User management routes
  userManagementRoutes,

  // Search and discovery routes
  searchRoutes
]);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Tourism Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Tourism Server API',
    version: '1.0.0',
    documentation: '/swagger',
    endpoints: {
      authentication: '/api/v1/login, /api/v1/signup*',
      content: '/api/v1/news/trips, /api/v1/discuss/questions, /api/v1/story',
      interactions: '/api/v1/*/like, /api/v1/*/reply, /api/v1/agency/*/reviews',
      users: '/api/v1/profile, /api/v1/users/search',
      search: '/api/v1/search, /api/v1/filter'
    }
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: '/api'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global Error:', error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Database connection with enhanced error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${mongoose.connection.name}`);

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

// Start server
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Tourism Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📋 API Documentation: http://localhost:${PORT}/api`);
    console.log(`💊 Health Check: http://localhost:${PORT}/health`);
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
    } else {
      console.error('❌ Server error:', error);
    }
    process.exit(1);
  });
};

// Start the application
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

module.exports = app;