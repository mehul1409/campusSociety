const jwt = require('jsonwebtoken');

const verifyCoordinatorToken = (req, res, next) => {
    var token;

    if (process.env.NODE_ENV !== 'development') {
        token = req.cookies.coordinatortoken;
    } else {
        token = req.headers['coordinatorauthorize'];
    }

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const JWT_SECRET = process.env.JWT_SECRET
        const decoded = jwt.verify(token, JWT_SECRET);

        req.coordinatorId = decoded.coordinatorId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = verifyCoordinatorToken;
