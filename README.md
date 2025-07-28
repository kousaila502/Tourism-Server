# 🏛️ Algerian Tourism API

> **Professional REST API for promoting Algerian destinations with social features and travel agency integration**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![API Version](https://img.shields.io/badge/API-v1.0.0-brightgreen.svg)](https://github.com/kousaila502/algerian-tourism-api)

## 📖 Overview

A comprehensive backend server for Android tourism applications, designed to showcase Algeria's rich cultural heritage and stunning destinations. The API provides secure authentication, content management, social features, and travel agency integration.

### 🎯 **Key Features**

- 🏛️ **Tourist Destinations** - Complete guides for Algerian regions and landmarks
- 📱 **Social Platform** - Stories, discussions, and community engagement
- 🏢 **Agency Integration** - Travel agency management and trip booking
- 🔐 **Secure Authentication** - JWT-based auth with role-based access control
- 📸 **Media Management** - Secure file uploads with validation
- ⭐ **Review System** - Agency ratings and user feedback
- 🔍 **Advanced Search** - Intelligent filtering and discovery
- 📄 **Pagination** - Efficient data loading for mobile apps

### 🏗️ **Architecture Highlights**

- **Unified Data Models** - Streamlined from 13 to 5 models (60% code reduction)
- **Professional Error Handling** - Comprehensive error management
- **Rate Limiting** - API abuse protection
- **Input Validation** - Robust data validation
- **CORS Support** - Production-ready cross-origin configuration

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm**
- **MongoDB** 6.0+ (local or Atlas)
- **Git** for version control

### Installation

```bash
# Clone the repository
git clone https://github.com/kousaila502/algerian-tourism-api.git
cd algerian-tourism-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Create uploads directory
mkdir uploads

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/TourismDB

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Email Service (for OTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp

# CORS Configuration
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## 📱 API Documentation

### Base URL
```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

### Quick API Test
```bash
# Health check
curl http://localhost:5000/health

# Get API info
curl http://localhost:5000/api

# Get trips with pagination
curl "http://localhost:5000/api/v1/news/trips?page=1&limit=10"
```

### 🔑 Authentication

```bash
# Register new user
curl -X POST http://localhost:5000/api/v1/signupUser \
  -F "name=John Doe" \
  -F "email=user@example.com" \
  -F "password=password123" \
  -F "confirmPassword=password123" \
  -F "location=Algiers, Algeria"

# Login
curl -X POST http://localhost:5000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 📄 Complete Documentation

- **Swagger/OpenAPI**: Available at `/swagger` (when configured)
- **Postman Collection**: [Download here](docs/Tourism-API.postman_collection.json)
- **API Reference**: See [API.md](docs/API.md) for detailed endpoint documentation

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm test            # Run test suite (when configured)
npm run lint        # Run ESLint (when configured)
```

### Project Structure

```
algerian-tourism-api/
├── controllers/           # Request handlers (5 unified controllers)
│   ├── authentication.js # Auth, OTP, password reset
│   ├── ContentController.js # Trips, questions, stories
│   ├── InteractionController.js # Likes, replies, reviews
│   ├── UserController.js  # Profiles, follows
│   └── SearchController.js # Search & filtering
├── models/               # Database models (5 unified models)
│   ├── User.js          # Users & agencies (role-based)
│   ├── Content.js       # All content types (type field)
│   ├── Interaction.js   # All interactions (type field)
│   ├── Relationship.js  # Follows & favorites
│   └── Location.js      # Location data
├── middleware/          # Custom middleware
│   ├── authMiddleware.js # JWT validation
│   ├── roleMiddleware.js # Role-based access
│   ├── validation.js    # Input validation
│   ├── errorHandler.js  # Error management
│   └── corsConfig.js    # CORS configuration
├── routes/              # API routes
├── uploads/             # File storage
├── docs/               # Documentation
├── app.js              # Express app configuration
└── server.js           # Server entry point
```

## 🧪 Testing

### Test Accounts

The API includes pre-configured test accounts for development:

**Test Agencies:**
- **Sahara Adventures** (Tamanrasset) - `sahara@agency.com:123456`
- **Atlas Tours** (Algiers) - `atlas@agency.com:123456`
- **Mediterranean Travels** (Oran) - `med@agency.com:123456`

**Test Users:**
- **Ahmed Benali** (Algiers) - `ahmed@user.com:123456`
- **Fatima Cherif** (Constantine) - `fatima@user.com:123456`
- **Omar Mansouri** (Oran) - `omar@user.com:123456`

### Sample API Calls

```bash
# Get paginated trips
curl "http://localhost:5000/api/v1/news/trips?page=1&limit=5"

# Search trips by tags
curl "http://localhost:5000/api/v1/news/trips?search=@sahara"

# Get questions with pagination
curl "http://localhost:5000/api/v1/discuss/questions?page=1&limit=10"

# Universal search
curl "http://localhost:5000/api/v1/search?q=algiers&type=trip"
```

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Authorization** (User, Agency, Admin)
- **Rate Limiting** (100 req/15min general, 5 req/15min auth)
- **Input Validation** for all endpoints
- **File Upload Security** (type validation, size limits)
- **CORS Protection** with environment-based origins
- **Password Hashing** using bcrypt
- **SQL Injection Protection** via Mongoose ODM

## 📊 Performance Features

- **Pagination** for all list endpoints
- **Database Indexing** for optimized queries
- **Efficient File Storage** with unique naming
- **Memory Management** with request size limits
- **Graceful Error Handling** without server crashes

## 🌍 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` in environment
- [ ] Configure production database (MongoDB Atlas)
- [ ] Set up secure JWT secrets
- [ ] Configure production CORS origins
- [ ] Set up file storage (AWS S3/Cloudinary)
- [ ] Configure production email service
- [ ] Set up monitoring and logging
- [ ] Configure HTTPS/SSL certificates

### Docker Support (Optional)

```dockerfile
# Coming soon - Docker configuration for easy deployment
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/kousaila502/algerian-tourism-api/issues)
- **Documentation**: [Wiki](https://github.com/kousaila502/algerian-tourism-api/wiki)
- **Email**: kousaila502@example.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Algeria Tourism Ministry** for destination information
- **MongoDB** for excellent database solutions
- **Express.js** community for robust web framework
- **JWT** for secure authentication standards

## 🗺️ Roadmap

### Version 1.1.0 (Coming Soon)
- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (Arabic, French, English)
- [ ] Mobile app SDK
- [ ] AI-powered recommendations

### Version 1.2.0 (Future)
- [ ] Payment integration for bookings
- [ ] Advanced trip planning features
- [ ] Integration with external booking systems
- [ ] Machine learning for personalized suggestions

---