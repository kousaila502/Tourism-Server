# Contributing to Algerian Tourism API

Thank you for your interest in contributing to the Algerian Tourism API! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue templates** provided
3. **Include detailed information**:
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, etc.)
   - Screenshots or logs if applicable

### Suggesting Features

We welcome feature suggestions! Please:

1. **Check the roadmap** in README.md first
2. **Open a feature request issue** with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach
   - Any relevant examples or mockups

## 🔧 Development Setup

### Prerequisites

- Node.js 18+
- MongoDB 6.0+
- Git
- A code editor (VS Code recommended)

### Local Development

```bash
# Fork and clone your fork
git clone https://github.com/YOUR_USERNAME/algerian-tourism-api.git
cd algerian-tourism-api

# Add upstream remote
git remote add upstream https://github.com/kousaila502/algerian-tourism-api.git

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your local configuration

# Create uploads directory
mkdir uploads

# Start development server
npm run dev
```

### Branch Naming Convention

Use descriptive branch names:

- `feature/add-user-authentication`
- `fix/pagination-bug-in-trips`
- `docs/update-api-documentation`
- `refactor/optimize-database-queries`

## 📝 Code Style & Standards

### JavaScript Style Guide

We follow these conventions:

```javascript
// Use camelCase for variables and functions
const userName = 'john_doe';
const getUserProfile = async (userId) => {
  // Function implementation
};

// Use PascalCase for constructors and classes
class UserController {
  constructor() {
    // Constructor implementation
  }
}

// Use UPPER_SNAKE_CASE for constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Always use const/let, never var
const apiVersion = 'v1';
let requestCount = 0;

// Use async/await instead of callbacks
const fetchUserData = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    throw new Error(`User not found: ${error.message}`);
  }
};
```

### Project Structure Rules

- **Controllers**: Handle HTTP requests/responses only
- **Models**: Define data structures and validation
- **Middleware**: Reusable functions for request processing
- **Routes**: Define API endpoints and link to controllers
- **Utils**: Helper functions and utilities

### Error Handling

Always use the centralized error handling:

```javascript
// In controllers - throw errors, don't handle them
const createTrip = async (req, res, next) => {
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    next(error); // Let error middleware handle it
  }
};

// Use descriptive error messages
if (!destination) {
  throw new Error('Destination is required for trip creation');
}
```

### Database Guidelines

```javascript
// Use descriptive field names
const tripSchema = new mongoose.Schema({
  destination: String,        // Good
  dest: String,              // Avoid abbreviations
  
  // Use proper validation
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [100000, 'Price cannot exceed 100,000']
  },
  
  // Use consistent field naming
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

## 🧪 Testing Guidelines

### Test Structure

```javascript
// Example test structure
describe('Trip Controller', () => {
  describe('GET /api/v1/news/trips', () => {
    it('should return paginated trips', async () => {
      // Test implementation
    });
    
    it('should return 400 for invalid pagination params', async () => {
      // Test implementation
    });
  });
});
```

### Writing Good Tests

- **Test one thing at a time**
- **Use descriptive test names**
- **Include both positive and negative test cases**
- **Test edge cases and error conditions**
- **Use setup/teardown for test data**

## 📚 Documentation Standards

### Code Comments

```javascript
/**
 * Creates a new trip with validation and file upload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const createTrip = async (req, res, next) => {
  // Implementation
};

// Use comments for complex business logic
// Calculate trip price based on duration and season
const calculatePrice = (basePice, duration, season) => {
  // Complex calculation logic here
};
```

### API Documentation

- Update Swagger/OpenAPI specs for new endpoints
- Include request/response examples
- Document all parameters and their validation rules
- Add error response examples

## 🔍 Code Review Process

### Before Submitting a PR

1. **Self-review your code**
2. **Run tests locally**: `npm test`
3. **Check code style**: `npm run lint`
4. **Update documentation** if needed
5. **Write descriptive commit messages**

### Commit Message Format

```
type(scope): description

- feat(auth): add password reset functionality
- fix(trips): resolve pagination bug in trip listing
- docs(readme): update installation instructions
- refactor(models): optimize user query performance
- test(api): add integration tests for trip endpoints
```

### Pull Request Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements left in code
```

## 🔒 Security Guidelines

### Security Best Practices

- **Never commit sensitive data** (passwords, API keys, etc.)
- **Validate all user inputs**
- **Use parameterized queries** to prevent injection
- **Implement proper authentication/authorization**
- **Follow principle of least privilege**

### Reporting Security Issues

For security vulnerabilities:

1. **DO NOT create a public issue**
2. **Email security concerns** to: security@yourproject.com
3. **Include detailed description** and steps to reproduce
4. **Wait for response** before public disclosure

## 🎯 Performance Guidelines

### Database Performance

```javascript
// Use indexes for frequently queried fields
userSchema.index({ email: 1 });
tripSchema.index({ destination: 1, price: 1 });

// Use projection to limit returned fields
const users = await User.find({}, 'name email location');

// Use pagination for large datasets
const trips = await Trip.find()
  .skip((page - 1) * limit)
  .limit(limit);
```

### API Performance

- **Implement pagination** for list endpoints
- **Use appropriate HTTP status codes**
- **Minimize response payload size**
- **Implement caching** where appropriate

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version number bumped
- [ ] Git tag created
- [ ] Deployment tested

## 📞 Getting Help

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bug reports and feature requests
- **Email**: For private concerns or security issues

## 🙏 Recognition

Contributors will be:

- **Listed in CONTRIBUTORS.md**
- **Mentioned in release notes** for significant contributions
- **Given credit** in relevant documentation
