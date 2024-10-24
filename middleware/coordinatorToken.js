const jwt = require('jsonwebtoken');

const verifyCoordinatorToken = (req, res, next) => {
    // const token = req.cookies.token;

    const token = req.headers['coordinatorauthorize'];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        // Verify the token
        const JWT_SECRET = process.env.JWT_SECRET
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach decoded info (like coordinatorId) to the request object for further use
        req.coordinatorId = decoded.coordinatorId;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = verifyCoordinatorToken;
