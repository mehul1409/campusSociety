const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/student.js');
const College = require('../models/college.js');
const Hub = require('../models/hub.js');

const studentRegister = async (req, res) => {
    const { name, email, password, collegeId } = req.body;

    try {
        const college = await College.findById(collegeId);
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = new Student({
            name,
            email,
            password: hashedPassword,
            collegeId
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
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'wrong password' });
        }

        const JWT_SECRET = process.env.JWT_SECRET
        const token = jwt.sign({ studentId: student._id, collegeId: student.collegeId }, JWT_SECRET, {
            expiresIn: '1h'
        });

        const hubs = await Hub.find({ collegeId: student.collegeId });

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3600000, 
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });

        return res.status(200).json({
            message: 'Login successful',
            hubs,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const getAllStudents = async (req, res) => {
    try {
      const customHeader = req.headers['access-token'];
      if (!customHeader) {
        res.status(500).send('Headers not provided!');
      }
  
      if (customHeader === process.env.accessToken) {
        const students = await Student.find();
        res.status(200).json(students);
      } else {
        res.status(500).send('Invalid Header value!');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).send('Server error');
    }
  }

  const updateStudent = async (req, res) => {
    const { name, email, password } = req.body;
    const { studentId } = req.params;
  
    try {
      const customHeader = req.headers['access-token'];
      if (!customHeader) {
        throw new Error('Header not provided!');
      }
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      if (customHeader === process.env.accessToken) {
        if (name) {
          student.name = name;
        }
        if (email) {
          student.email = email;
        }
        if (password) {
          student.password = await bcrypt.hash(password, 10);
        }
  
        await student.save();
  
        return res.status(200).json({ message: 'student details updated successfully' });
      } else {
        throw new Error('Invalid header value!');
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
  const deleteStudent = async (req, res) => {
    const { studentId } = req.params;
    try {
      const customHeader = req.headers['access-token'];
      if (!customHeader) {
        throw new Error('Header not provided!');
      }
      if (customHeader === process.env.accessToken) {
        const student = await Student.findById(studentId);
        if (!student) {
          return res.status(404).json({ message: 'Student not found' });
        }
  
        await Student.findByIdAndDelete(studentId);
  
        return res.status(200).json({ message: 'Student deleted successfully' });
      } else {
        throw new Error('Invalid header value!');
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

module.exports = {studentRegister, studentLogin, getAllStudents, updateStudent, deleteStudent};