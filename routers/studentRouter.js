const express = require('express');
const studentRouter = express.Router();
const Student = require('../models/student.js');

const {studentRegister, studentLogin} = require('../controllers/studentController.js');
const verifyStudentToken = require('../middleware/studentController.js');

studentRouter.post('/register',studentRegister);
studentRouter.post('/login',studentLogin);

studentRouter.get('/profile', verifyStudentToken, async (req, res) => {
    try {
        const student = await Student.findById(req.studentId);
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

studentRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
});

module.exports = studentRouter;