const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/student.js');
const College = require('../models/college.js');
const Hub = require('../models/hub.js');

const studentRegister = async (req, res) => {
    const { name, email, password, collegeId } = req.body;

    try {
        // Check if the college exists
        const college = await College.findById(collegeId);
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the student
        const newStudent = new Student({
            name,
            email,
            password: hashedPassword,
            collegeId // Associate student with the college
        });

        await newStudent.save();

        res.status(201).json({ message: 'Student registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const studentLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the student by email
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const JWT_SECRET = process.env.JWT_SECRET
        const token = jwt.sign({ studentId: student._id, collegeId: student.collegeId }, JWT_SECRET, {
            expiresIn: '1h'
        });

        // Fetch all hubs related to the student's college
        const hubs = await Hub.find({ collegeId: student.collegeId });

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3600000, // 1 hour
            sameSite: 'strict' // CSRF protection
        });

        return res.status(200).json({
            message: 'Login successful',
            hubs
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {studentRegister, studentLogin};
