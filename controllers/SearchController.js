const User = require('../models/User');
const Content = require('../models/Content');

// Standardized error handler
const handleErrors = (error) => {
    console.log(error.message, error.code);
    return error.message || 'Search error occurred';
};

// ==================== UNIFIED SEARCH & FILTER ====================

// Main search/filter function
const search = async (req, res) => {
    try {
        const { atributs, wilaya, rate, numericFilter, after } = req.query;
        
        if (atributs === 'agency' || atributs === 'user') {
            return await searchUsers(req, res);
        } else if (atributs === 'trips') {
            return await searchTrips(req, res);
        } else if (atributs === 'questions') {
            return await searchQuestions(req, res);
        } else if (atributs === 'stories') {
            return await searchStories(req, res);
        } else {
            return await searchAll(req, res);
        }
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Search users/agencies
const searchUsers = async (req, res) => {
    try {
        const { wilaya, rate, role, query } = req.query;
        
        let queryObject = {};
        let sortList = { rate: -1, nbFollowers: -1 };
        
        // Filter by location
        if (wilaya) {
            queryObject.location = { $regex: wilaya, $options: 'i' };
            sortList = { rate: -1 };
        }
        
        // Filter by minimum rating
        if (rate) {
            queryObject.rate = { $gte: parseFloat(rate) };
        }
        
        // Filter by role (Agency, User, Admin)
        if (role) {
            queryObject.role = role;
        }
        
        // Text search
        if (query) {
            queryObject.$or = [
                { name: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        
        const result = await User.find(queryObject)
            .select('-password -otp -otpExpires')
            .sort(sortList)
            .limit(50);
        
        res.status(200).json({
            success: true,
            result,
            nbHits: result.length
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Search trips with advanced filters
const searchTrips = async (req, res) => {
    try {
        const { numericFilter, after, wilaya, rate, destination, tags } = req.query;
        
        let queryObject = { type: 'trip' };
        let sortList = { createdAt: -1 };
        
        // Filter by location
        if (wilaya) {
            queryObject.userLocation = { $regex: wilaya, $options: 'i' };
        }
        
        // Filter by destination
        if (destination) {
            queryObject.destination = { $regex: destination, $options: 'i' };
        }
        
        // Filter by tags
        if (tags) {
            queryObject.tags = { $in: tags.split(',') };
        }
        
        // Numeric filters for price and duration
        if (numericFilter) {
            const operatorMap = {
                '>': '$gt',
                '>=': '$gte',
                '=': '$eq',
                '<': '$lt',
                '<=': '$lte'
            };
            
            const regex = /\b(>|>=|=|<|<=)\b/g;
            let filters = numericFilter.replace(regex, (match) => `-${operatorMap[match]}-`);
            
            const options = ['minPrice', 'maxPrice', 'minDuration', 'maxDuration'];
            
            filters.split(',').forEach((item) => {
                const [field, operator, value] = item.split('-');
                if (options.includes(field)) {
                    queryObject[field] = { [operator]: Number(value) };
                }
            });
        }
        
        // Date filter (trips after X days from now)
        if (after) {
            const daysFromNow = Number(after);
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + daysFromNow);
            queryObject.tripDate = { $gte: futureDate };
        }
        
        const result = await Content.find(queryObject).sort(sortList);
        
        res.status(200).json({
            success: true,
            result,
            nbHits: result.length
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Search questions
const searchQuestions = async (req, res) => {
    try {
        const { query, tags, location } = req.query;
        
        let queryObject = { type: 'question' };
        let sortList = { createdAt: -1 };
        
        // Text search
        if (query) {
            if (query.charAt(0) === '@') {
                // Tag search
                const tag = query.substring(1);
                queryObject.tags = { $regex: tag, $options: 'i' };
            } else {
                // Text search
                queryObject.text = { $regex: query, $options: 'i' };
            }
        }
        
        // Filter by tags
        if (tags) {
            queryObject.tags = { $in: tags.split(',') };
        }
        
        // Filter by user location
        if (location) {
            queryObject.userLocation = { $regex: location, $options: 'i' };
        }
        
        const result = await Content.find(queryObject).sort(sortList);
        
        res.status(200).json({
            success: true,
            result,
            nbHits: result.length
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Search stories
const searchStories = async (req, res) => {
    try {
        const { location, locationId } = req.query;
        
        let queryObject = { type: 'story' };
        let sortList = { createdAt: -1 };
        
        // Filter by location ID
        if (locationId) {
            queryObject.locationId = locationId;
        }
        
        // Filter by user location
        if (location) {
            queryObject.userLocation = { $regex: location, $options: 'i' };
        }
        
        const result = await Content.find(queryObject).sort(sortList);
        
        res.status(200).json({
            success: true,
            result,
            nbHits: result.length
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Search all content types
const searchAll = async (req, res) => {
    try {
        const { query, location } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query required'
            });
        }
        
        // Search across all content
        const contentQuery = {
            $or: [
                { text: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } },
                { destination: { $regex: query, $options: 'i' } }
            ]
        };
        
        if (location) {
            contentQuery.userLocation = { $regex: location, $options: 'i' };
        }
        
        // Search users
        const userQuery = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        };
        
        const [content, users] = await Promise.all([
            Content.find(contentQuery).sort({ createdAt: -1 }).limit(20),
            User.find(userQuery).select('-password -otp -otpExpires').sort({ nbFollowers: -1 }).limit(10)
        ]);
        
        res.status(200).json({
            success: true,
            content: {
                items: content,
                count: content.length
            },
            users: {
                items: users,
                count: users.length
            },
            totalHits: content.length + users.length
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Get popular/trending content
const getTrending = async (req, res) => {
    try {
        const { type, location, limit = 10 } = req.query;
        
        let queryObject = {};
        if (type) queryObject.type = type;
        if (location) queryObject.userLocation = { $regex: location, $options: 'i' };
        
        // Sort by engagement (likes - dislikes + replies * 2)
        const result = await Content.aggregate([
            { $match: queryObject },
            {
                $addFields: {
                    engagementScore: {
                        $add: [
                            { $subtract: ['$likes', '$dislikes'] },
                            { $multiply: ['$replyCount', 2] }
                        ]
                    }
                }
            },
            { $sort: { engagementScore: -1, createdAt: -1 } },
            { $limit: parseInt(limit) }
        ]);
        
        res.status(200).json({
            success: true,
            trending: result,
            count: result.length
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
    // Main search function
    search,
    
    // Specific search functions
    searchUsers,
    searchTrips,
    searchQuestions,
    searchStories,
    searchAll,
    
    // Additional features
    getTrending,
    
    // Legacy compatibility
    filtrage: search
};