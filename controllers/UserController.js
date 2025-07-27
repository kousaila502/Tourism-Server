const User = require('../models/User');
const Relationship = require('../models/Relationship');

// Standardized error handler
const handleErrors = (error) => {
    console.log(error.message, error.code);
    let err = { name: '', email: '', password: '', location: '' };
    
    // Validation errors
    if (error.message.includes('validation failed') && error.errors) {
        Object.values(error.errors).forEach((errorObj) => {
            if (errorObj.properties && errorObj.properties.path) {
                err[errorObj.properties.path] = errorObj.properties.message;
            }
        });
    }
    
    // Duplicate email error
    if (error.code === 11000) {
        err.email = 'Email already exists';
        return err;
    }
    
    // Return the error message directly if no specific field errors
    if (Object.values(err).every(val => val === '')) {
        return error.message;
    }
    
    return err;
};

// ==================== PROFILE MANAGEMENT ====================

// Update user profile (works for both users and agencies)
const updateUserProfile = async (req, res) => {
    try {
        const picture = req.file;
        const userId = req.cookies.userid;
        const { name, email, password, location, sex, birthdayDate, description, phoneNumber } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        // Build update object
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (location) updateData.location = location;
        if (sex) updateData.sex = sex;
        if (birthdayDate) updateData.birthdayDate = new Date(birthdayDate);
        if (description) updateData.description = description;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        
        // Handle picture upload
        if (picture) {
            updateData.picture = picture.path;
        }
        
        // Handle password update (will be hashed by pre-save hook)
        if (password && password.trim() !== '') {
            updateData.password = password;
        }
        
        const updatedProfile = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            {
                new: true,
                runValidators: true
            }
        );
        
        if (!updatedProfile) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedProfile
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUserId = req.cookies.userid;
        
        const targetUserId = userId || requestingUserId;
        
        if (!targetUserId) {
            return res.status(401).json({
                success: false,
                message: 'User ID required'
            });
        }
        
        const user = await User.findById(targetUserId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Check if requesting user follows this user (if different users)
        let isFollowing = false;
        if (requestingUserId && requestingUserId !== targetUserId) {
            isFollowing = await Relationship.exists(requestingUserId, targetUserId, 'follow');
        }
        
        res.status(200).json({
            success: true,
            data: {
                ...user.toJSON(),
                isFollowing
            }
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// ==================== FOLLOW SYSTEM ====================

// Toggle follow/unfollow
const toggleFollow = async (req, res) => {
    try {
        const { agencyid, userId: targetUserId } = req.params;
        const userId = req.cookies.userid;
        
        // Support both parameter names for backward compatibility
        const targetId = agencyid || targetUserId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        if (!targetId) {
            return res.status(400).json({
                success: false,
                message: 'Target user ID required'
            });
        }
        
        if (userId === targetId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot follow yourself'
            });
        }
        
        // Check if target user exists
        const targetUser = await User.findById(targetId);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'Target user not found'
            });
        }
        
        // Toggle follow using Relationship model
        const result = await Relationship.toggle(userId, targetId, 'User', 'follow');
        
        // Update follower count
        const followerCount = await Relationship.countDocuments({
            targetId: targetId,
            type: 'follow'
        });
        
        const updatedUser = await User.findByIdAndUpdate(
            targetId,
            { nbFollowers: followerCount },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            action: result.action,
            message: `${result.action === 'added' ? 'Following' : 'Unfollowed'} successfully`,
            data: result.data,
            user: updatedUser
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Get user's followers
const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        const targetUserId = userId || req.cookies.userid;
        
        if (!targetUserId) {
            return res.status(400).json({
                success: false,
                message: 'User ID required'
            });
        }
        
        const followers = await Relationship.getTargetRelationships(targetUserId, 'follow', true);
        
        res.status(200).json({
            success: true,
            followers,
            count: followers.length
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Get users that a user is following
const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const targetUserId = userId || req.cookies.userid;
        
        if (!targetUserId) {
            return res.status(400).json({
                success: false,
                message: 'User ID required'
            });
        }
        
        const following = await Relationship.getUserRelationships(targetUserId, 'follow', true);
        
        res.status(200).json({
            success: true,
            following,
            count: following.length
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// ==================== USER SEARCH & DISCOVERY ====================

// Search users/agencies
const searchUsers = async (req, res) => {
    try {
        const { query, role, location } = req.query;
        
        const searchCriteria = {};
        
        // Text search in name or location
        if (query) {
            searchCriteria.$or = [
                { name: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        
        // Filter by role
        if (role) {
            searchCriteria.role = role;
        }
        
        // Filter by location
        if (location) {
            searchCriteria.location = { $regex: location, $options: 'i' };
        }
        
        const users = await User.find(searchCriteria)
            .select('-password -otp -otpExpires')
            .sort({ nbFollowers: -1, createdAt: -1 })
            .limit(50);
        
        res.status(200).json({
            success: true,
            users,
            count: users.length
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Get user statistics
const getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const targetUserId = userId || req.cookies.userid;
        
        if (!targetUserId) {
            return res.status(400).json({
                success: false,
                message: 'User ID required'
            });
        }
        
        // Get relationship counts
        const relationshipCounts = await Relationship.getUserCounts(targetUserId);
        const followerCount = await Relationship.countDocuments({
            targetId: targetUserId,
            type: 'follow'
        });
        
        // Get content counts if it's a Content model
        const Content = require('../models/Content');
        const contentCounts = await Content.aggregate([
            { $match: { userId: targetUserId } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const contentStats = {
            trips: 0,
            questions: 0,
            stories: 0
        };
        
        contentCounts.forEach(item => {
            contentStats[item._id + 's'] = item.count;
        });
        
        res.status(200).json({
            success: true,
            stats: {
                followers: followerCount,
                following: relationshipCounts.following,
                favorites: relationshipCounts.favorites,
                ...contentStats
            }
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
    // Profile management
    updateUserProfile,
    getUserProfile,
    getUserStats,
    
    // Follow system
    toggleFollow,
    getFollowers,
    getFollowing,
    
    // Search and discovery
    searchUsers,
    
    // Legacy function names for compatibility
    updateagencyprofil: updateUserProfile,
    updateuserprofil: updateUserProfile,
    Following: toggleFollow
};