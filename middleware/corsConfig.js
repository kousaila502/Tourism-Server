const cors = require('cors');

// Define allowed origins based on environment
const getAllowedOrigins = () => {
  const origins = [];
  
  // Development origins
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3000');  // React dev server
    origins.push('http://localhost:3001');  // Alternative React port
    origins.push('http://localhost:8080');  // Vue/other frameworks
    origins.push('http://127.0.0.1:3000');  // Alternative localhost
  }
  
  // Production origins from environment variables
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  
  if (process.env.MOBILE_APP_URL) {
    origins.push(process.env.MOBILE_APP_URL);
  }
  
  // Add any additional origins from environment
  if (process.env.ADDITIONAL_ORIGINS) {
    const additionalOrigins = process.env.ADDITIONAL_ORIGINS.split(',').map(origin => origin.trim());
    origins.push(...additionalOrigins);
  }
  
  // Fallback: allow all in development if no specific origins set
  if (origins.length === 0 && process.env.NODE_ENV === 'development') {
    return '*';
  }
  
  return origins;
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development if set to '*'
    if (allowedOrigins === '*') {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Allowed methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  
  // Allowed headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-API-Key'
  ],
  
  // Headers exposed to the browser
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count', 
    'Link'
  ],
  
  // Preflight cache time (24 hours)
  maxAge: 86400,
  
  // Handle preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Create CORS middleware
const corsMiddleware = cors(corsOptions);

// Custom CORS middleware with logging
const customCorsMiddleware = (req, res, next) => {
  // Log CORS requests in development
  if (process.env.NODE_ENV === 'development' && req.headers.origin) {
    console.log(`🌐 CORS request from: ${req.headers.origin}`);
  }
  
  corsMiddleware(req, res, next);
};

module.exports = {
  corsMiddleware: customCorsMiddleware,
  corsOptions,
  getAllowedOrigins
};