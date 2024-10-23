const College = require('../models/college.js');
const Spoc = require('../models/spoc.js');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin.js');
const jwt = require('jsonwebtoken');

const assignSpoc = async (req, res) => {
  const { collegeId, name, email } = req.body;

  try {
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    if (college.spocId) {
      return res.status(400).json({ message: 'SPOC is already assigned to this college' });
    }

    const generatedPassword = crypto.randomBytes(4).toString('hex').slice(0, 8);
    console.log(generatedPassword);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newSpoc = new Spoc({
      name,
      email,
      password: hashedPassword,
      collegeId
    });

    const savedSpoc = await newSpoc.save();

    college.spocId = savedSpoc._id;
    await college.save();

    return res.status(201).json({
      message: 'SPOC assigned successfully',
      spocId: savedSpoc._id,
      passwprd: generatedPassword,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
          return res.status(400).json({ message: 'Invalid email or password.' });
      }

      const validPassword = await bcrypt.compare(password, admin.password);

      if (!validPassword) {
          return res.status(400).json({ message: 'Invalid email or password.' });
      }

      const token = jwt.sign(
          { id: admin._id },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
      );

      res.cookie('adminToken', token,{ 
          httpOnly: true,
          maxAge: 3600000,
         sameSite: 'strict' });

      res.json({ message: 'Login successful', token });
  } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
  }
};

const adminRegister = async (req, res) => {
  try {
      const { name, email, password } = req.body;

      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
          return res.status(400).json({ message: 'Admin with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({ name, email, password : hashedPassword});
      await newAdmin.save();

      res.status(201).json({ message: 'Admin added successfully!' });
  } catch (error) {
      res.status(500).json({ message: 'Error adding admin', error });
  }
}

module.exports = { assignSpoc, adminLogin, adminRegister };