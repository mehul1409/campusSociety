const jwt = require('jsonwebtoken');

const verifyStudentToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        // Verify the token
        const JWT_SECRET = process.env.JWT_SECRET
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach student info to the request object
        req.studentId = decoded.studentId;
        req.collegeId = decoded.collegeId;

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = verifyStudentToken;
