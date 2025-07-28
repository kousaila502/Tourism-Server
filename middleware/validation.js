// Helper function to send validation errors
const sendValidationError = (res, errors) => {
    return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
    });
};

// Authentication validation
const validateSignup = (req, res, next) => {
    const { name, email, password, confirmPassword, location } = req.body;
    const errors = [];
    
    // Name validation
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    if (name && name.length > 50) {
        errors.push('Name cannot exceed 50 characters');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Password validation
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    if (password && password.length > 100) {
        errors.push('Password cannot exceed 100 characters');
    }
    
    // Confirm password
    if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    // Location validation
    if (!location || location.trim().length < 2) {
        errors.push('Location must be at least 2 characters');
    }
    
    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }
    
    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    
    if (!email || !email.trim()) {
        errors.push('Email is required');
    }
    
    if (!password || !password.trim()) {
        errors.push('Password is required');
    }
    
    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }
    
    next();
};

// Content validation
const validateTrip = (req, res, next) => {
    const { text, destination, price, duration, meetingPlace } = req.body;
    const errors = [];
    
    // Text validation
    if (!text || text.trim().length < 10) {
        errors.push('Trip description must be at least 10 characters');
    }
    if (text && text.length > 1000) {
        errors.push('Trip description cannot exceed 1000 characters');
    }
    
    // Destination validation
    if (!destination || destination.trim().length < 2) {
        errors.push('Destination is required and must be at least 2 characters');
    }
    
    // Meeting place validation
    if (!meetingPlace || meetingPlace.trim().length < 2) {
        errors.push('Meeting place is required');
    }
    
    // Price validation
    if (price !== undefined) {
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0 || priceNum > 100000) {
            errors.push('Price must be a number between 0 and 100,000');
        }
    }
    
    // Duration validation
    if (duration !== undefined) {
        const durationNum = parseInt(duration);
        if (isNaN(durationNum) || durationNum < 1 || durationNum > 365) {
            errors.push('Duration must be between 1 and 365 days');
        }
    }
    
    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }
    
    next();
};

const validateQuestion = (req, res, next) => {
    const { text, tags } = req.body;
    const errors = [];
    
    // Text validation
    if (!text || text.trim().length < 10) {
        errors.push('Question must be at least 10 characters');
    }
    if (text && text.length > 500) {
        errors.push('Question cannot exceed 500 characters');
    }
    
    // Tags validation
    if (!tags || tags.trim().length === 0) {
        errors.push('At least one tag is required');
    }
    
    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }
    
    next();
};

const validateReply = (req, res, next) => {
    const { text } = req.body;
    const errors = [];
    
    // Text validation
    if (!text || text.trim().length < 3) {
        errors.push('Reply must be at least 3 characters');
    }
    if (text && text.length > 500) {
        errors.push('Reply cannot exceed 500 characters');
    }
    
    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }
    
    next();
};

const validateReview = (req, res, next) => {
    const { text, rate } = req.body;
    const errors = [];
    
    // Text validation
    if (!text || text.trim().length < 5) {
        errors.push('Review must be at least 5 characters');
    }
    if (text && text.length > 300) {
        errors.push('Review cannot exceed 300 characters');
    }
    
    // Rating validation
    const rating = parseInt(rate);
    if (!rate || isNaN(rating) || rating < 1 || rating > 5) {
        errors.push('Rating must be a number between 1 and 5');
    }
    
    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }
    
    next();
};

const validateProfileUpdate = (req, res, next) => {
    const { name, email, location, phoneNumber, description } = req.body;
    const errors = [];
    
    // Name validation (if provided)
    if (name && (name.trim().length < 2 || name.length > 50)) {
        errors.push('Name must be between 2 and 50 characters');
    }
    
    // Email validation (if provided)
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Please enter a valid email address');
        }
    }
    
    // Location validation (if provided)
    if (location && location.trim().length < 2) {
        errors.push('Location must be at least 2 characters');
    }
    
    // Phone number validation (if provided)
    if (phoneNumber) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{8,15}$/;
        if (!phoneRegex.test(phoneNumber)) {
            errors.push('Please enter a valid phone number');
        }
    }
    
    // Description validation (if provided)
    if (description && description.length > 500) {
        errors.push('Description cannot exceed 500 characters');
    }
    
    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }
    
    next();
};

module.exports = {
    validateSignup,
    validateLogin,
    validateTrip,
    validateQuestion,
    validateReply,
    validateReview,
    validateProfileUpdate
};