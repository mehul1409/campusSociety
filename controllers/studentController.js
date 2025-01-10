const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/student.js');
const College = require('../models/college.js');
const Hub = require('../models/hub.js');
const sendEmail = require('../helpers/sendEmail.js');

const studentRegister = async (req, res) => {
  const { name, email, password, collegeId } = req.body;

  try {
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    const studentExists = await Student.findOne({ email });
    if (studentExists) {
      return res.json({ message: 'Email ID already exists' });
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
    const student = await Student.findOne({ email }).populate('collegeId');
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'wrong password' });
    }

    const JWT_SECRET = process.env.JWT_SECRET
    const token = jwt.sign({ studentId: student._id, collegeId: student.collegeId, role: 'student' }, JWT_SECRET, {
      expiresIn: '1h'
    });

    const hubs = await Hub.find({ collegeId: student.collegeId });

    res.cookie('studenttoken', token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({
      student,
      message: 'Login successful',
      // hubs,
      token,
      role: 'student'
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

const changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
console.log(email);
  try {
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    student.password = hashedNewPassword;
    await student.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email, role } = req.body;

  try {
    const user = await Student.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const resetLink = `http://localhost:5173/reset-password?token=${token}&role=${role}`;

    await sendEmail(user.email, 'Password Reset Request', `Click on the link to reset your password: ${resetLink}`);

    return res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong. Please try again later' });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await Student.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong. Please try again later' });
  }
};

module.exports = { studentRegister, studentLogin, getAllStudents, updateStudent, deleteStudent, changePassword, requestPasswordReset, resetPassword };
