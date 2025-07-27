# Tourism Server

Backend server for Android tourism application promoting Algerian destinations. Provides REST API for tourist guides, recommendations, social features, and agency integration with secure authentication and data management.

## Features

- **Tourist Guides**: Comprehensive information about Algerian regions, states, and places
- **Recommendations**: Personalized tourist place suggestions
- **Social Platform**: Photo sharing, discussions, and community interactions
- **Agency Integration**: Travel agency trip posting and management
- **Authentication**: Secure user registration and login system
- **File Management**: Image upload and storage capabilities
- **Review System**: Agency ratings and user feedback
- **Real-time Interactions**: Like/dislike system and user following

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer middleware
- **Validation**: Validator.js
- **Password Hashing**: bcrypt

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository
```bash
git clone https://github.com/kousaila502/Tourism-Server.git
cd Tourism-Server
```

2. Install dependencies
```bash
npm install
```

3. Create environment variables file
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tourism_db
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

5. Create uploads directory
```bash
mkdir uploads
```

6. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /login` - User/Agency login
- `POST /signupAgency` - Agency registration
- `POST /signupUser` - User registration
- `GET /logout` - User logout
- `POST /verifyotp` - Email verification
- `POST /resendOTPVerification` - Resend OTP

### Trip Management
- `GET /news/trips` - Get all trips
- `POST /news/trips` - Create trip (agencies only)
- `GET /news/trips/:id` - Get single trip
- `PATCH /news/trips/:id` - Update trip
- `DELETE /news/trips/:id` - Delete trip

### Discussion Forum
- `GET /discuss/questions` - Get all questions
- `POST /discuss/questions` - Create question
- `GET /discuss/questions/:id` - Get single question
- `PATCH /discuss/questions/:id` - Update question
- `DELETE /discuss/questions/:id` - Delete question

### Replies
- `GET /discuss/questions/:questionId/reply` - Get replies
- `POST /discuss/questions/:questionId/reply` - Create reply
- `PATCH /discuss/questions/:questionId/reply/:replyId` - Update reply
- `DELETE /discuss/questions/:questionId/reply/:replyId` - Delete reply

### Reactions
- `POST /discuss/questions/:id/like` - Like question
- `POST /discuss/questions/:id/dislike` - Dislike question
- `POST /news/trips/:id/like` - Like trip
- `POST /news/trips/:id/dislike` - Dislike trip

### Stories
- `GET /story/:locationId` - Get location stories
- `POST /story/:locationId` - Create story
- `DELETE /story/:locationId/:pictureId` - Delete story
- `PATCH /story/:locationId/:pictureId` - Update story

### Reviews
- `GET /agency/:agencyId/reviews` - Get agency reviews
- `POST /agency/:agencyId/reviews` - Create review
- `PATCH /agency/:agencyId/reviews/:id` - Update review
- `DELETE /agency/:agencyId/reviews/:id` - Delete review

### Social Features
- `POST /agency/:agencyId/follow` - Follow agency
- `POST /news/trips/:tripId/favorie` - Favorite trip
- `POST /discuss/questions/:questionId/favorie` - Favorite question
- `GET /Favorie` - Get user favorites

### Profile Management
- `PATCH /agencyprofiledit` - Update agency profile
- `PATCH /userprofiledit` - Update user profile

### Utilities
- `GET /filter` - Filter content
- `POST /forgetpassword/validation` - Validate email for password reset
- `POST /forgetpassword/sendmail` - Send password reset email
- `POST /forgetpassword/setnewpass` - Set new password

## Database Models

### Agency
- name, email, password, location
- phoneNumber, rate, picture
- certification, classification
- followers count, verification status

### User
- name, email, password
- profile picture, verification status
- role-based access control

### Trip
- title, description, destination
- price, duration, pictures
- agency reference, timestamps

### Question
- title, content, pictures
- author reference, reactions count
- creation and update timestamps

### Reply
- content, pictures
- question/trip reference, author
- reaction counts, timestamps

### Story
- location reference, pictures
- author information, timestamps
- interaction capabilities

### Review
- rating (1-5), comment
- agency and user references
- timestamps

## File Upload

The server supports file uploads for:
- Profile pictures (users and agencies)
- Trip images
- Question/reply attachments
- Story photos
- Agency documentation

Files are stored in the `/uploads` directory.

## Authentication & Authorization

- JWT-based authentication
- Role-based access control (User, Agency, Admin)
- Protected routes with middleware
- OTP email verification
- Password reset functionality

## Middleware

- **authMiddleware**: JWT token validation
- **roleMiddleware**: Role-based access control
- **multer**: File upload handling
- **CORS**: Cross-origin resource sharing
- **Express rate limiting**: API protection

## Project Structure

```
Tourism-Server/
├── controllers/        # Request handlers
├── middleware/         # Custom middleware
├── models/            # Database schemas
├── routes/            # API route definitions
├── uploads/           # File storage
├── utils/             # Helper functions
├── app.js             # Express app configuration
├── server.js          # Server entry point
└── package.json       # Dependencies
```

## Development

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

### Linting
```bash
npm run lint
```

## Deployment

### Environment Setup
1. Set production environment variables
2. Configure MongoDB connection
3. Set up file storage (local or cloud)
4. Configure CORS for client domains

### Production Considerations
- Use PM2 for process management
- Set up reverse proxy (Nginx)
- Configure SSL certificates
- Implement logging and monitoring
- Set up automated backups

## API Documentation

Interactive API documentation is available via Swagger UI:
- Development: `http://localhost:5000/api-docs`
- View swagger.yaml file for complete API specification

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Specific error details"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- File upload restrictions
- Rate limiting
- CORS protection
- SQL injection prevention


## Contact

For questions or support, please open an issue on GitHub or contact the development team.