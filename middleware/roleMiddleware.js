const User = require('../models/User');

const requireAgency = async (req, res, next) => {
    try {
        const userId = req.cookies.userid;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        if (user.role !== 'Agency') {
            return res.status(403).json({
                success: false,
                message: "Only agency accounts can perform this action"
            });
        }
        
        req.user = user; // Add user info to request
        next();
        
    } catch (error) {
        console.error('Role middleware error:', error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const requireUser = async (req, res, next) => {
    try {
        const userId = req.cookies.userid;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        if (user.role !== 'User') {
            return res.status(403).json({
                success: false,
                message: "Only user accounts can perform this action"
            });
        }
        
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Role middleware error:', error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const requireAdmin = async (req, res, next) => {
    try {
        const userId = req.cookies.userid;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        if (user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }
        
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Role middleware error:', error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = { 
    requireAgency, 
    requireUser, 
    requireAdmin 
};