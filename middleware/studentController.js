const jwt = require('jsonwebtoken');

const verifyStudentToken = (req, res, next) => {

    let token;

    if (process.env.NODE_ENV !== 'development') {
        token = req.cookies.studenttoken;
    } else {
        token = req.headers['studentauthorize'];
    }

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const JWT_SECRET = process.env.JWT_SECRET
        const decoded = jwt.verify(token, JWT_SECRET);

        req.studentId = decoded.studentId;
        req.collegeId = decoded.collegeId;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = verifyStudentToken;
