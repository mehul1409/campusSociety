const College = require('../models/college.js');
const Spoc = require('../models/spoc.js');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin.js');
const jwt = require('jsonwebtoken');

const assignSpoc = async (req, res) => {

  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

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

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your SPOC Login Details',
      text: `Hello ${name},\n\nYou have been assigned as the SPOC for the college "${college.collegeName}". Here are your login details:\n\nID: ${savedSpoc._id}\nPassword: ${generatedPassword}\n\nPlease log in at [Portal URL].\n\nBest regards,\n[Your Organization's Name]`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      message: 'SPOC assigned successfully',
      spocId: savedSpoc._id,
      password: generatedPassword,
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

    res.cookie('adminToken', token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

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
    const newAdmin = new Admin({ name, email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: 'Admin added successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding admin', error });
  }
}

const getAllAdmins = async (req, res) => {
  try {
    const customHeader = req.headers['access-token'];
    if (!customHeader) {
      res.status(500).send('Headers not provided!');
    }

    if (customHeader === process.env.accessToken) {
      const admins = await Admin.find();
      res.status(200).json(admins);
    } else {
      res.status(500).send('Invalid Header value!');
    }
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).send('Server error');
  }
}

const updateAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  const { adminId } = req.params;

  try {
    const customHeader = req.headers['access-token'];
    if (!customHeader) {
      throw new Error('Header not provided!');
    }
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    if (customHeader === process.env.accessToken) {
      if (name) {
        admin.name = name;
      }
      if (email) {
        admin.email = email;
      }
      if (password) {
        admin.password = await bcrypt.hash(password, 10);
      }

      await admin.save();

      return res.status(200).json({ message: 'admin details updated successfully' });
    } else {
      throw new Error('Invalid header value!');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteAdmin = async (req, res) => {
  const { adminId } = req.params;
  try {
    const customHeader = req.headers['access-token'];
    if (!customHeader) {
      throw new Error('Header not provided!');
    }
    if (customHeader === process.env.accessToken) {
      const student = await Admin.findById(adminId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      await Admin.findByIdAndDelete(adminId);

      return res.status(200).json({ message: 'Admin deleted successfully' });
    } else {
      throw new Error('Invalid header value!');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { assignSpoc, adminLogin, adminRegister, getAllAdmins, updateAdmin, deleteAdmin };