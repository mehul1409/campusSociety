const College = require('../models/college.js');
const Coordinator = require('../models/coordinator.js');
const Hub = require('../models/hub.js')
const Spoc = require('../models/spoc.js');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendEmail = require('../helpers/sendEmail.js');

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
      collegeId,
      hubId: null,
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

    savedCoordinator.hubId = savedHub._id;
    await savedCoordinator.save();

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
    const token = jwt.sign({ spocId: spoc._id, email: spoc.email, role:'spoc' }, JWT_SECRET, {
      expiresIn: '1h'
    });

    res.cookie('spoctoken', token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({ message: 'Login successful', token, role: 'spoc' });

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

const requestPasswordReset = async (req, res) => {
  const { email, role } = req.body;
  
  try {
    const user = await Spoc.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Spoc not found' });
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

    const user = await Spoc.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'Spoc not found' });
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

const getSpocById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "SPOC ID is required" });
    }

    const spoc = await Spoc.findById(id);

    if (!spoc) {
      return res.status(404).json({ message: "SPOC not found" });
    }

    res.status(200).json(spoc);
  } catch (error) {
    console.error("Error fetching SPOC:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = { changePassword, createHub, spocLogin, getAllSpocs, updateSpoc, deleteSpoc, requestPasswordReset, resetPassword, getSpocById };
