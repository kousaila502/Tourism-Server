# Tourism Server

Backend server for Android tourism application promoting Algerian destinations. Provides REST API for tourist guides, recommendations, social features, and agency integration with secure authentication and data management.

## 🚀 Features

- **Tourist Guides**: Comprehensive information about Algerian regions, states, and places
- **Recommendations**: Personalized tourist place suggestions  
- **Social Platform**: Photo sharing, discussions, and community interactions
- **Agency Integration**: Travel agency trip posting and management
- **Authentication**: Secure user registration and login system
- **File Management**: Image upload and storage capabilities
- **Review System**: Agency ratings and user feedback
- **Real-time Interactions**: Like/dislike system and user following
- **Advanced Search**: Filter content by location, price, date, and more
- **Unified Architecture**: Streamlined models and controllers for better performance

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer middleware
- **Validation**: Validator.js
- **Password Hashing**: bcrypt

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## ⚡ Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/kousaila502/Tourism-Server.git
cd Tourism-Server
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
```

4. **Configure environment variables in `.env`**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tourism_db
JWT_SECRET=your_super_secret_jwt_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
NODE_ENV=development
```

5. **Create uploads directory**
```bash
mkdir uploads
```

6. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

7. **Verify installation**
- Health check: `http://localhost:5000/health`
- API documentation: `http://localhost:5000/api`

## 📡 API Endpoints

> **Note**: All endpoints are prefixed with `/api/v1`

### 🔐 Authentication
- `POST /api/v1/login` - User/Agency login
- `POST /api/v1/signupAgency` - Agency registration
- `POST /api/v1/signupUser` - User registration
- `GET /api/v1/logout` - User logout
- `POST /api/v1/verifyotp` - Email verification
- `POST /api/v1/resendOTPVerification` - Resend OTP
- `POST /api/v1/forgotpassword` - Password reset
- `POST /api/v1/setnewpassword` - Set new password

### 🧳 Trip Management
- `GET /api/v1/news/trips` - Get all trips
- `POST /api/v1/news/trips` - Create trip (agencies only)
- `GET /api/v1/news/trips/:id` - Get single trip
- `PATCH /api/v1/news/trips/:id` - Update trip
- `DELETE /api/v1/news/trips/:id` - Delete trip

### 💬 Discussion Forum
- `GET /api/v1/discuss/questions` - Get all questions
- `POST /api/v1/discuss/questions` - Create question
- `GET /api/v1/discuss/questions/:id` - Get single question
- `PATCH /api/v1/discuss/questions/:id` - Update question
- `DELETE /api/v1/discuss/questions/:id` - Delete question

### 💭 Replies & Interactions
- `GET /api/v1/discuss/questions/:questionId/reply` - Get replies
- `POST /api/v1/discuss/questions/:questionId/reply` - Create reply
- `PATCH /api/v1/discuss/questions/:questionId/reply/:replyId` - Update reply
- `DELETE /api/v1/discuss/questions/:questionId/reply/:replyId` - Delete reply

### 👍 Reactions
- `POST /api/v1/discuss/questions/:id/like` - Like question
- `POST /api/v1/discuss/questions/:id/dislike` - Dislike question
- `POST /api/v1/news/trips/:id/like` - Like trip
- `POST /api/v1/news/trips/:id/dislike` - Dislike trip

### 📸 Stories
- `GET /api/v1/story/:locationId` - Get location stories
- `POST /api/v1/story/:locationId` - Create story
- `DELETE /api/v1/story/:locationId/:pictureId` - Delete story
- `PATCH /api/v1/story/:locationId/:pictureId` - Update story

### ⭐ Reviews
- `GET /api/v1/agency/:agencyId/reviews` - Get agency reviews
- `POST /api/v1/agency/:agencyId/reviews` - Create review
- `PATCH /api/v1/agency/:agencyId/reviews/:id` - Update review
- `DELETE /api/v1/agency/:agencyId/reviews/:id` - Delete review

### 👥 Social Features
- `POST /api/v1/agency/:agencyId/follow` - Follow agency
- `POST /api/v1/news/trips/:tripId/favorie` - Favorite trip
- `POST /api/v1/discuss/questions/:questionId/favorie` - Favorite question
- `GET /api/v1/Favorie` - Get user favorites

### 👤 Profile Management
- `PATCH /api/v1/userprofiledit` - Update user profile
- `PATCH /api/v1/agencyprofiledit` - Update agency profile
- `GET /api/v1/profile/:userId?` - Get user profile
- `GET /api/v1/users/search` - Search users

### 🔍 Search & Discovery
- `GET /api/v1/filter` - Advanced filtering
- `GET /api/v1/search` - Universal search
- `GET /api/v1/search/trips` - Search trips
- `GET /api/v1/search/questions` - Search questions
- `GET /api/v1/trending` - Get trending content

## 🗄️ Database Models

### User (Unified)
Handles both regular users and travel agencies:
- Basic info: name, email, password, location
- Profile: picture, description, phone number
- Role-based: User, Agency, Admin
- Social: followers count, verification status
- Agency-specific: certification, classification, rating

### Content (Unified)
Manages all content types with a `type` field:
- **Trip**: destination, price, duration, meeting place
- **Question**: discussion text and tags
- **Story**: location-based photo sharing
- Common: text, picture, tags, author info, engagement metrics

### Interaction (Unified)
Handles all user interactions:
- **Like/Dislike**: Content reactions
- **Reply**: Comments on content
- **Review**: Agency ratings and feedback
- Smart targeting system with automatic counting

### Relationship (Unified)
Manages user relationships:
- **Follow**: User following system
- **Favorite**: Content bookmarking
- Reference-based (no data duplication)

### Location
Simple location reference data for Algerian regions.

## 📁 Project Structure

```
Tourism-Server/
├── controllers/           # 5 unified controllers (was 15)
│   ├── authentication.js    # Auth & password reset
│   ├── ContentController.js # Trips, questions, stories
│   ├── InteractionController.js # Likes, replies, reviews
│   ├── UserController.js    # Profiles, follows
│   └── SearchController.js  # Search & filtering
├── middleware/           # Custom middleware
│   ├── authMiddleware.js   # JWT validation
│   └── roleMiddleware.js   # Role-based access
├── models/              # 5 unified models (was 13)
│   ├── User.js           # Users & agencies
│   ├── Content.js        # All content types
│   ├── Interaction.js    # All interactions
│   ├── Relationship.js   # Follows & favorites
│   └── Location.js       # Location data
├── routes/              # API route definitions
├── uploads/             # File storage
├── app.js              # Express app configuration
└── package.json        # Dependencies
```

## 🔧 Development

### Running the Server
```bash
# Development with hot reload
npm run dev

# Production mode
npm start
```

### API Testing
- **Health Check**: `GET /health`
- **API Info**: `GET /api`
- **Swagger Docs**: Available via swagger.yaml

### Environment Variables
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/tourism_db

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Email (for OTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif
```

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET
3. Configure production MongoDB URI
4. Set up reverse proxy (Nginx)
5. Configure SSL certificates
6. Set up PM2 for process management

### Docker Support
```dockerfile
# Coming soon - Docker configuration
```

## 🔒 Security Features

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control
- **Password Security**: bcrypt hashing with salt
- **Input Validation**: Comprehensive request validation
- **File Upload Security**: Type and size restrictions
- **CORS Protection**: Configurable origins
- **Rate Limiting**: API protection (configurable)

## 📊 Performance Features

- **Unified Models**: Reduced database queries
- **Smart Indexing**: Optimized database performance  
- **Efficient Relationships**: Reference-based instead of data duplication
- **Caching Strategy**: Prepared for Redis integration
- **Request Optimization**: Pagination and field selection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/kousaila502/Tourism-Server/issues)
- **Documentation**: Available in `/docs`
- **API Reference**: `http://localhost:5000/api`

## 🎯 Roadmap

- [ ] Real-time notifications with WebSockets
- [ ] Redis caching implementation
- [ ] Docker containerization
- [ ] Automated testing suite
- [ ] API rate limiting
- [ ] Advanced analytics dashboard
- [ ] Mobile app SDK

---

**Built for promoting Algerian tourism**