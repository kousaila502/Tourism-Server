const mongoose = require('mongoose');

const RelationshipSchema = new mongoose.Schema({
    // Relationship Type
    type: {
        type: String,
        enum: ['follow', 'favorite'],
        required: [true, 'Relationship type is required']
    },
    
    // User performing the action
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    
    // Target of the relationship
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Target ID is required'],
        refPath: 'targetType'
    },
    
    // What type of target (User for follows, Content for favorites)
    targetType: {
        type: String,
        enum: ['User', 'Content'],
        required: [true, 'Target type is required']
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Compound indexes for efficient queries
RelationshipSchema.index({ userId: 1, type: 1 });
RelationshipSchema.index({ targetId: 1, type: 1 });
RelationshipSchema.index({ type: 1, createdAt: -1 });

// Unique constraint (user can only follow/favorite something once)
RelationshipSchema.index(
    { userId: 1, targetId: 1, type: 1 }, 
    { unique: true }
);

// Static method to toggle relationship (follow/unfollow, favorite/unfavorite)
RelationshipSchema.statics.toggle = async function(userId, targetId, targetType, relationshipType) {
    if (!['follow', 'favorite'].includes(relationshipType)) {
        throw new Error('Invalid relationship type');
    }
    
    // Check if relationship already exists
    const existing = await this.findOne({
        userId,
        targetId,
        type: relationshipType
    });
    
    if (existing) {
        // Remove existing relationship
        await this.deleteOne({ _id: existing._id });
        return { action: 'removed', type: relationshipType };
    } else {
        // Create new relationship
        const newRelationship = await this.create({
            userId,
            targetId,
            targetType,
            type: relationshipType
        });
        
        return { action: 'added', type: relationshipType, data: newRelationship };
    }
};

// Static method to check if relationship exists
RelationshipSchema.statics.exists = async function(userId, targetId, relationshipType) {
    const relationship = await this.findOne({
        userId,
        targetId,
        type: relationshipType
    });
    
    return !!relationship;
};

// Static method to get user's relationships
RelationshipSchema.statics.getUserRelationships = function(userId, type = null, populate = true) {
    const query = { userId };
    if (type) query.type = type;
    
    const findQuery = this.find(query).sort({ createdAt: -1 });
    
    if (populate) {
        return findQuery.populate('targetId');
    }
    
    return findQuery;
};

// Static method to get followers/people who favorited
RelationshipSchema.statics.getTargetRelationships = function(targetId, type = null, populate = true) {
    const query = { targetId };
    if (type) query.type = type;
    
    const findQuery = this.find(query).sort({ createdAt: -1 });
    
    if (populate) {
        return findQuery.populate('userId');
    }
    
    return findQuery;
};

// Static method to get relationship counts
RelationshipSchema.statics.getCounts = async function(targetId) {
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
        followers: 0,
        favorites: 0
    };
    
    counts.forEach(item => {
        if (item._id === 'follow') result.followers = item.count;
        if (item._id === 'favorite') result.favorites = item.count;
    });
    
    return result;
};

// Static method to get user's following/favorites count
RelationshipSchema.statics.getUserCounts = async function(userId) {
    const counts = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 }
            }
        }
    ]);
    
    const result = {
        following: 0,
        favorites: 0
    };
    
    counts.forEach(item => {
        if (item._id === 'follow') result.following = item.count;
        if (item._id === 'favorite') result.favorites = item.count;
    });
    
    return result;
};

// Static method to get user's favorites by content type
RelationshipSchema.statics.getFavoritesByType = async function(userId, contentType = null) {
    const pipeline = [
        { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'favorite' } },
        {
            $lookup: {
                from: 'contents',
                localField: 'targetId',
                foreignField: '_id',
                as: 'content'
            }
        },
        { $unwind: '$content' }
    ];
    
    if (contentType) {
        pipeline.push({ $match: { 'content.type': contentType } });
    }
    
    pipeline.push({ $sort: { createdAt: -1 } });
    
    return this.aggregate(pipeline);
};

// Static method to get recommended content (based on user's favorites)
RelationshipSchema.statics.getRecommendations = async function(userId, limit = 10) {
    const userFavorites = await this.find({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'favorite'
    }).populate('targetId');
    
    if (userFavorites.length === 0) return [];
    
    // Get tags from user's favorite content
    const userTags = [];
    userFavorites.forEach(fav => {
        if (fav.targetId && fav.targetId.tags) {
            userTags.push(...fav.targetId.tags);
        }
    });
    
    // Find content with similar tags that user hasn't favorited
    const Content = mongoose.model('Content');
    const favoriteIds = userFavorites.map(fav => fav.targetId._id);
    
    return Content.find({
        tags: { $in: userTags },
        _id: { $nin: favoriteIds }
    }).limit(limit).sort({ likes: -1 });
};

// Instance method to check ownership
RelationshipSchema.methods.belongsTo = function(userId) {
    return this.userId.toString() === userId.toString();
};

// Virtual for relationship description
RelationshipSchema.virtual('description').get(function() {
    const actionText = this.type === 'follow' ? 'followed' : 'favorited';
    return `User ${actionText} this ${this.targetType.toLowerCase()}`;
});

// Ensure virtual fields are included in JSON output
RelationshipSchema.set('toJSON', { virtuals: true });

const Relationship = mongoose.model('Relationship', RelationshipSchema);
module.exports = Relationship;