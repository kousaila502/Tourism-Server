const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
    // Interaction Type
    type: {
        type: String,
        enum: ['like', 'dislike', 'reply', 'review'],
        required: [true, 'Interaction type is required']
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
        trim: true
    },
    
    // Target Information (what is being interacted with)
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Target ID is required']
    },
    targetType: {
        type: String,
        enum: ['content', 'user', 'reply'],
        required: [true, 'Target type is required']
    },
    
    // Content (for replies and reviews)
    text: {
        type: String,
        required: function() {
            return this.type === 'reply' || this.type === 'review';
        },
        trim: true,
        maxlength: [500, 'Text cannot exceed 500 characters']
    },
    picture: {
        type: String,
        default: null
    },
    
    // Rating (for reviews only)
    rating: {
        type: Number,
        required: function() {
            return this.type === 'review';
        },
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    
    // Engagement for replies (replies can be liked/disliked)
    likes: {
        type: Number,
        default: 0,
        min: [0, 'Likes cannot be negative']
    },
    dislikes: {
        type: Number,
        default: 0,
        min: [0, 'Dislikes cannot be negative']
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Compound indexes for efficient queries
InteractionSchema.index({ type: 1, targetId: 1 });
InteractionSchema.index({ userId: 1, type: 1 });
InteractionSchema.index({ targetId: 1, targetType: 1 });
InteractionSchema.index({ type: 1, createdAt: -1 });

// Unique constraint for likes/dislikes (one per user per target)
InteractionSchema.index(
    { userId: 1, targetId: 1, type: 1 }, 
    { 
        unique: true,
        partialFilterExpression: { 
            type: { $in: ['like', 'dislike'] } 
        }
    }
);

// Static method to toggle like/dislike
InteractionSchema.statics.toggleReaction = async function(userId, targetId, targetType, reactionType) {
    if (!['like', 'dislike'].includes(reactionType)) {
        throw new Error('Invalid reaction type');
    }
    
    // Check if reaction already exists
    const existingReaction = await this.findOne({
        userId,
        targetId,
        type: reactionType
    });
    
    if (existingReaction) {
        // Remove existing reaction
        await this.deleteOne({ _id: existingReaction._id });
        return { action: 'removed', reaction: reactionType };
    } else {
        // Remove opposite reaction if exists
        const oppositeType = reactionType === 'like' ? 'dislike' : 'like';
        await this.deleteOne({
            userId,
            targetId,
            type: oppositeType
        });
        
        // Create new reaction
        const newReaction = await this.create({
            type: reactionType,
            userId,
            targetId,
            targetType
        });
        
        return { action: 'added', reaction: reactionType, data: newReaction };
    }
};

// Static method to get interaction counts
InteractionSchema.statics.getCounts = async function(targetId) {
    const counts = await this.aggregate([
        { $match: { targetId: new mongoose.Types.ObjectId(targetId) } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 }
            }
        }
    ]);
    
    const result = {
        likes: 0,
        dislikes: 0,
        replies: 0,
        reviews: 0
    };
    
    counts.forEach(item => {
        result[item._id + 's'] = item.count;
    });
    
    return result;
};

// Static method to get user's interactions
InteractionSchema.statics.getUserInteractions = function(userId, type = null) {
    const query = { userId };
    if (type) query.type = type;
    
    return this.find(query)
        .populate('targetId')
        .sort({ createdAt: -1 });
};

// Static method to get replies for content
InteractionSchema.statics.getReplies = function(targetId, targetType = 'content') {
    return this.find({
        targetId,
        targetType,
        type: 'reply'
    }).sort({ createdAt: -1 });
};

// Static method to get reviews for user/agency
InteractionSchema.statics.getReviews = function(targetId) {
    return this.find({
        targetId,
        targetType: 'user',
        type: 'review'
    }).sort({ createdAt: -1 });
};

// Static method to get average rating
InteractionSchema.statics.getAverageRating = async function(targetId) {
    const result = await this.aggregate([
        { 
            $match: { 
                targetId: new mongoose.Types.ObjectId(targetId),
                type: 'review'
            } 
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);
    
    return result.length > 0 ? {
        average: Math.round(result[0].averageRating * 10) / 10,
        total: result[0].totalReviews
    } : { average: 0, total: 0 };
};

// Instance method to check if user can modify
InteractionSchema.methods.canModify = function(userId) {
    return this.userId.toString() === userId.toString();
};

// Virtual for interaction summary
InteractionSchema.virtual('summary').get(function() {
    switch(this.type) {
        case 'like':
            return `${this.username} liked this`;
        case 'dislike':
            return `${this.username} disliked this`;
        case 'reply':
            return `${this.username}: ${this.text.substring(0, 50)}...`;
        case 'review':
            return `${this.username} rated ${this.rating}/5: ${this.text.substring(0, 50)}...`;
        default:
            return 'Unknown interaction';
    }
});

// Virtual for engagement score (for replies)
InteractionSchema.virtual('engagementScore').get(function() {
    if (this.type === 'reply') {
        return this.likes - this.dislikes;
    }
    return 0;
});

// Ensure virtual fields are included in JSON output
InteractionSchema.set('toJSON', { virtuals: true });

const Interaction = mongoose.model('Interaction', InteractionSchema);
module.exports = Interaction;