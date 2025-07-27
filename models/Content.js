const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    // Content Type (determines which fields are required)
    type: {
        type: String,
        enum: ['trip', 'question', 'story'],
        required: [true, 'Content type is required']
    },
    
    // Basic Content Information
    text: {
        type: String,
        required: function() {
            return this.type === 'trip' || this.type === 'question';
        },
        trim: true,
        maxlength: [1000, 'Text cannot exceed 1000 characters']
    },
    picture: {
        type: String,
        required: function() {
            return this.type === 'story';
        }
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: function(tags) {
                return this.type === 'story' || tags.length > 0;
            },
            message: 'At least one tag is required for trips and questions'
        }
    },
    
    // Author Information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true
    },
    userPicture: {
        type: String,
        default: null
    },
    userLocation: {
        type: String,
        required: [true, 'User location is required'],
        trim: true
    },
    
    // Engagement Metrics
    likes: {
        type: Number,
        default: 0,
        min: [0, 'Likes cannot be negative']
    },
    dislikes: {
        type: Number,
        default: 0,
        min: [0, 'Dislikes cannot be negative']
    },
    replyCount: {
        type: Number,
        default: 0,
        min: [0, 'Reply count cannot be negative']
    },
    reportCount: {
        type: Number,
        default: 0,
        min: [0, 'Report count cannot be negative']
    },
    
    // Trip-specific fields
    tripDate: {
        type: Date,
        required: function() {
            return this.type === 'trip';
        }
    },
    minDuration: {
        type: Number,
        required: function() {
            return this.type === 'trip';
        },
        min: [1, 'Duration must be at least 1 day']
    },
    maxDuration: {
        type: Number,
        required: function() {
            return this.type === 'trip';
        },
        min: [1, 'Duration must be at least 1 day']
    },
    minPrice: {
        type: Number,
        required: function() {
            return this.type === 'trip';
        },
        min: [0, 'Price cannot be negative']
    },
    maxPrice: {
        type: Number,
        required: function() {
            return this.type === 'trip';
        },
        min: [0, 'Price cannot be negative']
    },
    destination: {
        type: String,
        required: function() {
            return this.type === 'trip';
        },
        trim: true
    },
    meetingPlace: {
        type: String,
        required: function() {
            return this.type === 'trip';
        },
        trim: true
    },
    
    // Story-specific fields
    locationId: {
        type: String,
        required: function() {
            return this.type === 'story';
        },
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better performance
ContentSchema.index({ type: 1 });
ContentSchema.index({ userId: 1 });
ContentSchema.index({ userLocation: 1 });
ContentSchema.index({ tags: 1 });
ContentSchema.index({ createdAt: -1 });
ContentSchema.index({ likes: -1 });
ContentSchema.index({ type: 1, createdAt: -1 });

// Validate price range for trips
ContentSchema.pre('save', function(next) {
    if (this.type === 'trip' && this.maxPrice < this.minPrice) {
        return next(new Error('Maximum price cannot be less than minimum price'));
    }
    
    if (this.type === 'trip' && this.maxDuration < this.minDuration) {
        return next(new Error('Maximum duration cannot be less than minimum duration'));
    }
    
    next();
});

// Static method to get content by type
ContentSchema.statics.getByType = function(type, options = {}) {
    const query = { type };
    
    // Add search functionality
    if (options.search) {
        if (options.search.startsWith('@')) {
            // Tag search
            const tag = options.search.substring(1);
            query.tags = { $regex: tag, $options: 'i' };
        } else {
            // Text search
            query.text = { $regex: options.search, $options: 'i' };
        }
    }
    
    // Add location filter
    if (options.location) {
        query.userLocation = { $regex: options.location, $options: 'i' };
    }
    
    return this.find(query).sort({ createdAt: -1 });
};

// Static method to get user's content
ContentSchema.statics.getUserContent = function(userId, type = null) {
    const query = { userId };
    if (type) query.type = type;
    
    return this.find(query).sort({ createdAt: -1 });
};

// Instance method to increment engagement
ContentSchema.methods.incrementLikes = function() {
    this.likes += 1;
    return this.save();
};

ContentSchema.methods.decrementLikes = function() {
    if (this.likes > 0) {
        this.likes -= 1;
        return this.save();
    }
    return this;
};

ContentSchema.methods.incrementDislikes = function() {
    this.dislikes += 1;
    return this.save();
};

ContentSchema.methods.decrementDislikes = function() {
    if (this.dislikes > 0) {
        this.dislikes -= 1;
        return this.save();
    }
    return this;
};

ContentSchema.methods.incrementReplies = function() {
    this.replyCount += 1;
    return this.save();
};

ContentSchema.methods.decrementReplies = function() {
    if (this.replyCount > 0) {
        this.replyCount -= 1;
        return this.save();
    }
    return this;
};

// Virtual for content summary
ContentSchema.virtual('summary').get(function() {
    if (this.type === 'trip') {
        return `${this.destination} - ${this.minDuration}-${this.maxDuration} days - $${this.minPrice}-${this.maxPrice}`;
    } else if (this.type === 'question') {
        return this.text.substring(0, 100) + (this.text.length > 100 ? '...' : '');
    } else if (this.type === 'story') {
        return `Story from ${this.userLocation}`;
    }
});

// Virtual for engagement score
ContentSchema.virtual('engagementScore').get(function() {
    return this.likes - this.dislikes + (this.replyCount * 2);
});

// Ensure virtual fields are included in JSON output
ContentSchema.set('toJSON', { virtuals: true });

const Content = mongoose.model('Content', ContentSchema);
module.exports = Content;