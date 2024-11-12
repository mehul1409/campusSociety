const College = require('../models/college.js');
const Coordinator = require('../models/coordinator.js');
const Hub = require('../models/hub.js')
const Spoc = require('../models/spoc.js');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    const spoc = await Spoc.findOne({email});
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
  
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

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

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: coordinatorDetails.email,
      subject: 'Your Hub Portal Login Details',
      text: `Hello ${coordinatorDetails.name},\n\nYou have been assigned as the coordinator for the hub "${hubName}". Here are your login details:\n\nID: ${savedCoordinator._id}\nPassword: ${generatedPassword}\n\nPlease log in at [Portal URL].\n\nBest regards,\n[Your Organization's Name]`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      message: 'Hub created successfully and email also sent successfully!',
      hubId: savedHub._id,
      coordinatorId: savedCoordinator._id,
      password: generatedPassword,
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const spocLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const spoc = await Spoc.findOne({ email });
    if (!spoc) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, spoc.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const JWT_SECRET = process.env.JWT_SECRET
    const token = jwt.sign({ spocId: spoc._id, email: spoc.email }, JWT_SECRET, {
      expiresIn: '1h'
    });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({ message: 'Login successful', token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

const getAllSpocs = async (req, res) => {
  try {
    const customHeader = req.headers['access-token'];
    if (!customHeader) {
      res.status(500).send('Headers not provided!');
    }

    if (customHeader === process.env.accessToken) {
      const spocs = await Spoc.find();
      res.status(200).json(spocs);
    } else {
      res.status(500).send('Invalid Header value!');
    }
  } catch (error) {
    console.error('Error fetching SPOCs:', error);
    res.status(500).send('Server error');
  }
}

const updateSpoc = async (req, res) => {
  const { name, email, password } = req.body;
  const { spocId } = req.params;

  try {
    const customHeader = req.headers['access-token'];
    if (!customHeader) {
      throw new Error('Header not provided!');
    }
    const spoc = await Spoc.findById(spocId);
    if (!spoc) {
      return res.status(404).json({ message: 'SPOC not found' });
    }
    if (customHeader === process.env.accessToken) {
      if (name) {
        spoc.name = name;
      }
      if (email) {
        spoc.email = email;
      }
      if (password) {
        spoc.password = await bcrypt.hash(password, 10);
      }

      await spoc.save();

      return res.status(200).json({ message: 'SPOC details updated successfully' });
    } else {
      throw new Error('Invalid header value!');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteSpoc = async (req, res) => {
  const { spocId } = req.params;
  try {
    const customHeader = req.headers['access-token'];
    if (!customHeader) {
      throw new Error('Header not provided!');
    }
    if (customHeader === process.env.accessToken) {
      const spoc = await Spoc.findById(spocId);
      if (!spoc) {
        return res.status(404).json({ message: 'SPOC not found' });
      }

      await Spoc.findByIdAndDelete(spocId);
      await College.updateOne({ spocId }, { $unset: { spocId: "" } });

      return res.status(200).json({ message: 'SPOC deleted successfully' });
    } else {
      throw new Error('Invalid header value!');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { changePassword, createHub, spocLogin, getAllSpocs, updateSpoc, deleteSpoc };
