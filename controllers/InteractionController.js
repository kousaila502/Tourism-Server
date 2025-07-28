const Interaction = require('../models/Interaction');
const Relationship = require('../models/Relationship');
const Content = require('../models/Content');
const User = require('../models/User');

// Standardized error handler
const handleErrors = (error) => {
    console.log(error.message, error.code);
    let err = { text: '', rating: '' };

    // Validation errors
    if (error.message.includes('validation failed') && error.errors) {
        Object.values(error.errors).forEach((errorObj) => {
            if (errorObj.properties && errorObj.properties.path) {
                err[errorObj.properties.path] = errorObj.properties.message;
            }
        });
    }

    // Return the error message directly if no specific field errors
    if (Object.values(err).every(val => val === '')) {
        return error.message;
    }

    return err;
};

// Get user info from cookie
const getUserInfo = async (req) => {
    const userId = req.cookies.userid;
    if (!userId) {
        throw new Error('User not authenticated');
    }
    return await User.findById(userId);
};

// ==================== LIKES & DISLIKES ====================

// Like content (questions, trips, stories)
const likeContent = async (req, res) => {
    try {
        const { questionid, tripid, idPicture } = req.params;
        const userId = req.cookies.userid;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Get user info
        const userInfo = await getUserInfo(req);

        // Determine content ID
        let contentId;
        if (questionid) {
            contentId = questionid;
        } else if (tripid) {
            contentId = tripid;
        } else if (idPicture) {
            contentId = idPicture;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Content ID required'
            });
        }

        // Check if like already exists
        const existingLike = await Interaction.findOne({
            userId,
            targetId: contentId,
            type: 'like'
        });

        let result;
        if (existingLike) {
            // Remove like
            await Interaction.deleteOne({ _id: existingLike._id });
            result = { action: 'removed', type: 'like' };
        } else {
            // Remove any existing dislike
            await Interaction.deleteOne({
                userId,
                targetId: contentId,
                type: 'dislike'
            });

            // Create new like
            const newLike = await Interaction.create({
                type: 'like',
                userId,
                username: userInfo.name,
                userPicture: userInfo.picture,
                userLocation: userInfo.location,
                targetId: contentId,
                targetType: 'content'
            });

            result = { action: 'added', type: 'like', data: newLike };
        }

        // Update content like count
        const likeCount = await Interaction.countDocuments({
            targetId: contentId,
            type: 'like'
        });

        const updatedContent = await Content.findByIdAndUpdate(
            contentId,
            { likes: likeCount },
            { new: true }
        );

        res.status(200).json({
            success: true,
            action: result.action,
            message: `Like ${result.action}`,
            content: updatedContent
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Dislike content (questions, trips, stories)
const dislikeContent = async (req, res) => {
    try {
        const { questionid, tripid, idPicture } = req.params;
        const userId = req.cookies.userid;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Get user info
        const userInfo = await getUserInfo(req);

        // Determine content ID
        let contentId;
        if (questionid) {
            contentId = questionid;
        } else if (tripid) {
            contentId = tripid;
        } else if (idPicture) {
            contentId = idPicture;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Content ID required'
            });
        }

        // Check if dislike already exists
        const existingDislike = await Interaction.findOne({
            userId,
            targetId: contentId,
            type: 'dislike'
        });

        let result;
        if (existingDislike) {
            // Remove dislike
            await Interaction.deleteOne({ _id: existingDislike._id });
            result = { action: 'removed', type: 'dislike' };
        } else {
            // Remove any existing like
            await Interaction.deleteOne({
                userId,
                targetId: contentId,
                type: 'like'
            });

            // Create new dislike
            const newDislike = await Interaction.create({
                type: 'dislike',
                userId,
                username: userInfo.name,
                userPicture: userInfo.picture,
                userLocation: userInfo.location,
                targetId: contentId,
                targetType: 'content'
            });

            result = { action: 'added', type: 'dislike', data: newDislike };
        }

        // Update content dislike count
        const dislikeCount = await Interaction.countDocuments({
            targetId: contentId,
            type: 'dislike'
        });

        const updatedContent = await Content.findByIdAndUpdate(
            contentId,
            { dislikes: dislikeCount },
            { new: true }
        );

        res.status(200).json({
            success: true,
            action: result.action,
            message: `Dislike ${result.action}`,
            content: updatedContent
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Like reply
const likeReply = async (req, res) => {
    try {
        const { replyid } = req.params;
        const userId = req.cookies.userid;

        // Toggle like using Interaction model
        const result = await Interaction.toggleReaction(userId, replyid, 'reply', 'like');

        // Update reply like count
        const likeCount = await Interaction.countDocuments({
            targetId: replyid,
            type: 'like'
        });

        const updatedReply = await Interaction.findByIdAndUpdate(
            replyid,
            { likes: likeCount },
            { new: true }
        );

        res.status(200).json({
            success: true,
            action: result.action,
            message: `Reply like ${result.action}`,
            reply: updatedReply
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Dislike reply
const dislikeReply = async (req, res) => {
    try {
        const { replyid } = req.params;
        const userId = req.cookies.userid;

        // Toggle dislike using Interaction model
        const result = await Interaction.toggleReaction(userId, replyid, 'reply', 'dislike');

        // Update reply dislike count
        const dislikeCount = await Interaction.countDocuments({
            targetId: replyid,
            type: 'dislike'
        });

        const updatedReply = await Interaction.findByIdAndUpdate(
            replyid,
            { dislikes: dislikeCount },
            { new: true }
        );

        res.status(200).json({
            success: true,
            action: result.action,
            message: `Reply dislike ${result.action}`,
            reply: updatedReply
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// ==================== REPLIES ====================

// Get replies for content
const getReplies = async (req, res) => {
    try {
        const { questionId, tripid } = req.params;
        const contentId = questionId || tripid;

        const replies = await Interaction.find({
            targetId: contentId,
            targetType: 'content',
            type: 'reply'
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            reply: replies,
            nbHits: replies.length
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Create reply
const createReply = async (req, res) => {
    try {
        const { questionId, tripid } = req.params;
        const image = req.file;
        const { text } = req.body;
        const userInfo = await getUserInfo(req);

        const contentId = questionId || tripid;

        const replyData = {
            type: 'reply',
            text,
            picture: image ? image.path : null,
            userId: userInfo._id,
            username: userInfo.name,
            userPicture: userInfo.picture,
            userLocation: userInfo.location,
            targetId: contentId,
            targetType: 'content'
        };

        const newReply = await Interaction.create(replyData);

        // Update content reply count
        const replyCount = await Interaction.countDocuments({
            targetId: contentId,
            type: 'reply'
        });

        const updatedContent = await Content.findByIdAndUpdate(
            contentId,
            { replyCount },
            { new: true }
        );

        res.status(201).json({
            success: true,
            data: newReply,
            content: updatedContent
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Get single reply
const getSingleReply = async (req, res) => {
    try {
        const { replyId } = req.params;

        const reply = await Interaction.findOne({
            _id: replyId,
            type: 'reply'
        });

        if (!reply) {
            return res.status(404).json({
                success: false,
                message: 'Reply not found'
            });
        }

        res.status(200).json({
            success: true,
            data: reply
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Update reply
const updateReply = async (req, res) => {
    try {
        const { replyId } = req.params;
        const image = req.file;
        const { text } = req.body;

        const updateData = { text };
        if (image) {
            updateData.picture = image.path;
        }

        const updated = await Interaction.findOneAndUpdate(
            { _id: replyId, type: 'reply' },
            updateData,
            { runValidators: true, new: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Reply not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updated
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Delete reply
const deleteReply = async (req, res) => {
    try {
        const { questionId, tripid, replyId } = req.params;
        const contentId = questionId || tripid;

        const deleted = await Interaction.findOneAndDelete({
            _id: replyId,
            type: 'reply'
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Reply not found'
            });
        }

        // Update content reply count
        const replyCount = await Interaction.countDocuments({
            targetId: contentId,
            type: 'reply'
        });

        const updatedContent = await Content.findByIdAndUpdate(
            contentId,
            { replyCount },
            { new: true }
        );

        res.status(200).json({
            success: true,
            reply: deleted,
            content: updatedContent
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// ==================== REVIEWS ====================

// Get reviews for agency
const getReviews = async (req, res) => {
    try {
        const { agencyId } = req.params;

        const reviews = await Interaction.find({
            targetId: agencyId,
            targetType: 'user',
            type: 'review'
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            reviews,
            nbHits: reviews.length
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Create review
const createReviews = async (req, res) => {
    try {
        const { agencyId } = req.params;
        const { text, rate } = req.body;
        const userInfo = await getUserInfo(req);

        const reviewData = {
            type: 'review',
            text,
            rating: parseInt(rate),
            userId: userInfo._id,
            username: userInfo.name,
            userPicture: userInfo.picture,
            userLocation: userInfo.location,
            targetId: agencyId,
            targetType: 'user'
        };

        const newReview = await Interaction.create(reviewData);

        // Calculate and update agency average rating
        const avgRating = await Interaction.getAverageRating(agencyId);
        await User.findByIdAndUpdate(agencyId, { rate: avgRating.average });

        res.status(201).json({
            success: true,
            data: newReview
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Update review
const updateReviews = async (req, res) => {
    try {
        const { id: reviewid, agencyId } = req.params;
        const { text, rate } = req.body;

        const updated = await Interaction.findOneAndUpdate(
            { _id: reviewid, type: 'review' },
            { text, rating: parseInt(rate) },
            { runValidators: true, new: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Recalculate and update agency average rating
        const avgRating = await Interaction.getAverageRating(agencyId);
        await User.findByIdAndUpdate(agencyId, { rate: avgRating.average });

        res.status(200).json({
            success: true,
            data: updated
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Delete review
const deleteReviews = async (req, res) => {
    try {
        const { id: reviewid, agencyId } = req.params;

        const deleted = await Interaction.findOneAndDelete({
            _id: reviewid,
            type: 'review'
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Recalculate and update agency average rating
        const avgRating = await Interaction.getAverageRating(agencyId);
        await User.findByIdAndUpdate(agencyId, { rate: avgRating.average });

        res.status(200).json({
            success: true,
            data: deleted
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// ==================== FAVORITES ====================

// Toggle favorite content
const toggleFavorite = async (req, res) => {
    try {
        const { questionid, tripid } = req.params;
        const userId = req.cookies.userid;

        const contentId = questionid || tripid;

        // Toggle favorite using Relationship model
        const result = await Relationship.toggle(userId, contentId, 'Content', 'favorite');

        res.status(200).json({
            success: true,
            action: result.action,
            message: `Favorite ${result.action}`,
            data: result.data
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Get user favorites
const getFavorites = async (req, res) => {
    try {
        const userId = req.cookies.userid;
        const { type } = req.query;

        let favorites;
        if (type === 'question') {
            favorites = await Relationship.getFavoritesByType(userId, 'question');
        } else if (type === 'trip') {
            favorites = await Relationship.getFavoritesByType(userId, 'trip');
        } else {
            favorites = await Relationship.getUserRelationships(userId, 'favorite');
        }

        res.status(200).json({
            success: true,
            [type ? `${type}Fav` : 'favorites']: favorites,
            nbHits: favorites.length
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

module.exports = {
    // Like/Dislike functions
    likeContent,
    dislikeContent,
    likeReply,
    dislikeReply,

    // Reply functions
    getReplies,
    createReply,
    getSingleReply,
    updateReply,
    deleteReply,

    // Review functions
    getReviews,
    createReviews,
    updateReviews,
    deleteReviews,

    // Favorite functions
    toggleFavorite,
    getFavorites,

    // Legacy function names for compatibility
    createlikequestion: likeContent,
    createdislikequestion: dislikeContent,
    createliketrip: likeContent,
    createdisliketrip: dislikeContent,
    createlikepicture: likeContent,
    createdislikepicture: dislikeContent,
    createlikereply: likeReply,
    createdislikereply: dislikeReply,
    createliketripreply: likeReply,
    createdisliketripreply: dislikeReply,
    getReply: getReplies,
    getsinglereply: getSingleReply,
    favoriequestion: toggleFavorite,
    favorietrip: toggleFavorite,
    getFavorie: getFavorites
};