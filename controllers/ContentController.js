const Content = require('../models/Content');
const User = require('../models/User');

// Standardized error handler
const handleErrors = (error) => {
    console.log(error.message, error.code);
    let err = { text: '', tags: '', destination: '', price: '' };
    
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

// ==================== TRIPS ====================

// Get all trips
const getTrips = async (req, res) => {
    try {
        let { search } = req.query;
        const queryObject = { type: 'trip' };
        let sortList = { createdAt: -1 };
        
        // Search functionality
        if (search) {
            if (search.charAt(0) === '@') {
                // Tag search
                search = search.substring(1);
                queryObject.tags = { $regex: search, $options: 'i' };
            } else {
                // Text search
                queryObject.text = { $regex: search, $options: 'i' };
            }
        }
        
        const trips = await Content.find(queryObject).sort(sortList);
        
        res.status(200).json({
            success: true,
            trips,
            nbHits: trips.length
        });
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Create new trip
const createTrips = async (req, res) => {
    try {
        const picture = req.file;
        const { text, date, duration, price, meetingPlace, destination, tags } = req.body;
        
        // Get user info
        const userInfo = await getUserInfo(req);
        
        // Process tags
        const processedTags = typeof tags === 'string' 
            ? tags.replace(/\s/g, '').split(',') 
            : tags || [];
        
        const tripData = {
            type: 'trip',
            text,
            picture: picture ? picture.path : null,
            tags: processedTags,
            userId: userInfo._id,
            username: userInfo.name,
            userPicture: userInfo.picture,
            userLocation: userInfo.location,
            tripDate: new Date(date),
            minDuration: parseInt(duration),
            maxDuration: parseInt(duration),
            minPrice: parseFloat(price),
            maxPrice: parseFloat(price),
            meetingPlace,
            destination
        };
        
        const newTrip = await Content.create(tripData);
        
        res.status(201).json({
            success: true,
            data: newTrip
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Get single trip
const getSingleTrip = async (req, res) => {
    try {
        const { tripid } = req.params;
        
        const trip = await Content.findOne({ _id: tripid, type: 'trip' });
        
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: trip
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Update trip
const updateTrips = async (req, res) => {
    try {
        const { tripid } = req.params;
        const image = req.file;
        const { text, tags, date, duration, price, meetingPlace, destination } = req.body;
        
        const updateData = {
            text,
            tags: typeof tags === 'string' ? tags.replace(/\s/g, '').split(',') : tags,
            tripDate: date ? new Date(date) : undefined,
            minDuration: duration ? parseInt(duration) : undefined,
            maxDuration: duration ? parseInt(duration) : undefined,
            minPrice: price ? parseFloat(price) : undefined,
            maxPrice: price ? parseFloat(price) : undefined,
            meetingPlace,
            destination
        };
        
        if (image) {
            updateData.picture = image.path;
        }
        
        // Remove undefined values
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );
        
        const updated = await Content.findOneAndUpdate(
            { _id: tripid, type: 'trip' },
            updateData,
            { runValidators: true, new: true }
        );
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
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

// Delete trip
const deleteTrips = async (req, res) => {
    try {
        const { tripid } = req.params;
        
        const deleted = await Content.findOneAndDelete({ _id: tripid, type: 'trip' });
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }
        
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

// ==================== QUESTIONS ====================

// Get all questions
const getQuestions = async (req, res) => {
    try {
        let { search } = req.query;
        const queryObject = { type: 'question' };
        let sortList = { createdAt: -1 };
        
        // Search functionality
        if (search) {
            if (search.charAt(0) === '@') {
                // Tag search
                search = search.substring(1);
                queryObject.tags = { $regex: search, $options: 'i' };
            } else {
                // Text search
                queryObject.text = { $regex: search, $options: 'i' };
            }
        }
        
        const questions = await Content.find(queryObject).sort(sortList);
        
        res.status(200).json({
            success: true,
            questions,
            nbHits: questions.length
        });
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Create new question
const createQuestions = async (req, res) => {
    try {
        const picture = req.file;
        const { text, tags } = req.body;
        
        // Get user info
        const userInfo = await getUserInfo(req);
        
        // Process tags
        const processedTags = typeof tags === 'string' 
            ? tags.replace(/\s/g, '').split(',') 
            : tags || [];
        
        const questionData = {
            type: 'question',
            text,
            picture: picture ? picture.path : null,
            tags: processedTags,
            userId: userInfo._id,
            username: userInfo.name,
            userPicture: userInfo.picture,
            userLocation: userInfo.location
        };
        
        const newQuestion = await Content.create(questionData);
        
        res.status(201).json({
            success: true,
            data: newQuestion
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Get single question
const getSingleQuestion = async (req, res) => {
    try {
        const { id: questionid } = req.params;
        
        const question = await Content.findOne({ _id: questionid, type: 'question' });
        
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: question
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Update question
const updateQuestions = async (req, res) => {
    try {
        const { id: questionid } = req.params;
        const image = req.file;
        const { text, tags } = req.body;
        
        const updateData = {
            text,
            tags: typeof tags === 'string' ? tags.replace(/\s/g, '').split(',') : tags
        };
        
        if (image) {
            updateData.picture = image.path;
        }
        
        // Remove undefined values
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );
        
        const updated = await Content.findOneAndUpdate(
            { _id: questionid, type: 'question' },
            updateData,
            { runValidators: true, new: true }
        );
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
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

// Delete question
const deleteQuestions = async (req, res) => {
    try {
        const { id: questionid } = req.params;
        
        const deleted = await Content.findOneAndDelete({ _id: questionid, type: 'question' });
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }
        
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

// ==================== STORIES ====================

// Create new story
const createStory = async (req, res) => {
    try {
        const { idLocation } = req.params;
        const picture = req.file;
        
        if (!picture) {
            return res.status(400).json({
                success: false,
                message: 'Picture is required for stories'
            });
        }
        
        // Get user info
        const userInfo = await getUserInfo(req);
        
        const storyData = {
            type: 'story',
            picture: picture.path,
            locationId: idLocation,
            userId: userInfo._id,
            username: userInfo.name,
            userPicture: userInfo.picture,
            userLocation: userInfo.location
        };
        
        const newStory = await Content.create(storyData);
        
        res.status(201).json({
            success: true,
            data: newStory
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Get stories by location
const getStoriesByLocation = async (req, res) => {
    try {
        const { idLocation } = req.params;
        
        const stories = await Content.find({ 
            type: 'story', 
            locationId: idLocation 
        }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: stories
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Delete story
const deleteStory = async (req, res) => {
    try {
        const { idPicture } = req.params;
        
        const deleted = await Content.findOneAndDelete({ 
            _id: idPicture, 
            type: 'story' 
        });
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Story deleted successfully'
        });
        
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Update story (likes/dislikes/reports)
const updateStory = async (req, res) => {
    try {
        const { idPicture } = req.params;
        const { like, dislike, report } = req.body;
        
        // Check if story should be deleted due to reports
        if (report && report >= 5) {
            const deleted = await Content.findOneAndDelete({ 
                _id: idPicture, 
                type: 'story' 
            });
            
            return res.status(200).json({
                success: true,
                message: 'Story deleted due to reports'
            });
        }
        
        const updateData = {};
        if (like !== undefined) updateData.likes = like;
        if (dislike !== undefined) updateData.dislikes = dislike;
        if (report !== undefined) updateData.reportCount = report;
        
        const updated = await Content.findOneAndUpdate(
            { _id: idPicture, type: 'story' },
            updateData,
            { runValidators: true, new: true }
        );
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
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

module.exports = {
    // Trip functions
    getTrips,
    createTrips,
    getSingleTrip,
    updateTrips,
    deleteTrips,
    
    // Question functions
    getQuestions,
    createQuestions,
    getSingleQuestion,
    updateQuestions,
    deleteQuestions,
    
    // Story functions
    createStory,
    getStoriesByLocation,
    deleteStory,
    updateStory
};