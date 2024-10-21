const College = require('../models/college.js');
const Coordinator = require('../models/coordinator.js');
const Hub = require('../models/hub.js')
const Spoc = require('../models/spoc.js');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const changePassword = async (req, res) => {
  const { spocId, currentPassword, newPassword } = req.body;

  try {
    const spoc = await Spoc.findById(spocId);
    if (!spoc) {
      return res.status(404).json({ message: 'SPOC not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, spoc.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    spoc.password = hashedNewPassword;
    await spoc.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const createHub = async (req, res) => {
  const { collegeId, hubName, coordinatorDetails } = req.body;

  //Coordinator Details : name, email

  try {
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    const generatedPassword = crypto.randomBytes(4).toString('hex').slice(0, 8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newCoordinator = new Coordinator({
      name: coordinatorDetails.name,
      email: coordinatorDetails.email,
      password: hashedPassword,
    });

    const savedCoordinator = await newCoordinator.save();

    const newHub = new Hub({
      hubName,
      collegeId,
      coordinatorId: savedCoordinator._id,
    });

    const savedHub = await newHub.save();

    college.hubs.push(savedHub._id);
    await college.save();

    return res.status(201).json({
      message: 'Hub created successfully',
      hubId: savedHub._id,
      coordinatorId: savedCoordinator._id,
      password:generatedPassword,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const spocLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the SPOC by email
    const spoc = await Spoc.findOne({ email });
    if (!spoc) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, spoc.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET
    const token = jwt.sign({ spocId: spoc._id, email: spoc.email }, JWT_SECRET, {
      expiresIn: '1h'
    });

    // Set token in an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
      sameSite: 'strict' // CSRF protection
    });

    return res.status(200).json({ message: 'Login successful' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { changePassword, createHub, spocLogin };
