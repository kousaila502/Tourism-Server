const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            } else {
                console.log(decodedToken);
                req.user = decodedToken; // Add user info to request
                next();
            }
        });
    } else {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
};

module.exports = { requireAuth };