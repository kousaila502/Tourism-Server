const { Router } = require('express');
const router = Router();
const contentController = require('../controllers/ContentController');
const multer = require('multer');
const path = require('path');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAgency } = require('../middleware/roleMiddleware');

// Secure multer configuration
const Storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        // Create unique filename to prevent conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
        cb(null, fileName);
    }
});

// File upload security configuration
const upload = multer({ 
    storage: Storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only 1 file per upload
    },
    fileFilter: function (req, file, cb) {
        // Only allow image files
        const allowedMimes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp'
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
        }
    }
});

// Input validation middleware for trips
const validateTripInput = (req, res, next) => {
    const { text, destination, price, duration } = req.body;
    const errors = [];
    
    // Validate text
    if (!text || text.trim().length < 10) {
        errors.push('Trip description must be at least 10 characters');
    }
    if (text && text.length > 1000) {
        errors.push('Trip description cannot exceed 1000 characters');
    }
    
    // Validate destination
    if (!destination || destination.trim().length < 2) {
        errors.push('Destination is required and must be at least 2 characters');
    }
    
    // Validate price
    if (price !== undefined) {
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0 || priceNum > 100000) {
            errors.push('Price must be a number between 0 and 100,000');
        }
    }
    
    // Validate duration
    if (duration !== undefined) {
        const durationNum = parseInt(duration);
        if (isNaN(durationNum) || durationNum < 1 || durationNum > 365) {
            errors.push('Duration must be a number between 1 and 365 days');
        }
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }
    
    next();
};

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Only 1 file allowed'
            });
        }
    }
    
    if (error.message.includes('Only image files')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
};

// Trip routes with enhanced security
router.get('/news/trips', contentController.getTrips);

router.post('/news/trips', [
    requireAuth, 
    requireAgency,
    upload.single('picture'),
    handleMulterError,
    validateTripInput
], contentController.createTrips);

router.route('/news/Trips/:tripid')
    .delete(contentController.deleteTrips)
    .patch([
        upload.single('picture'),
        handleMulterError,
        validateTripInput
    ], contentController.updateTrips)
    .get(contentController.getSingleTrip);

module.exports = router;