const jwt = require('jsonwebtoken');

const verifySpocToken = (req, res, next) => {

    let token;
    
    if (process.env.NODE_ENV !== 'development') {
        token = req.cookies.spoctoken;
    } else {
        token = req.headers['spocauthorize'];
    }

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        // Verify the token
        const JWT_SECRET = process.env.JWT_SECRET;

        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach decoded info (like spocId) to the request object for further use
        req.spocId = decoded.spocId;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = verifySpocToken;
