const Coordinator = require('../models/coordinator.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Hub = require('../models/hub.js');
const Event = require('../models/event.js');
const sendEmail = require('../helpers/sendEmail.js');

const changePassword = async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    try {
        const coordinator = await Coordinator.findOne({email});
        if (!coordinator) {
            return res.status(404).json({ message: 'Coordinator not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, coordinator.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        coordinator.password = hashedNewPassword;
        await coordinator.save();

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const postEvent = async (req, res) => {
    const { coordinatorId, eventDetails } = req.body;
    
    try {
      const hub = await Hub.findOne({coordinatorId});
      if (!hub) {
        return res.status(404).json({ message: 'Hub not found' });
      }
  
      const newEvent = new Event({
        hubId:hub._id,
        eventDetails: {
          title: eventDetails.title,
          description: eventDetails.description,
          date: eventDetails.date,
          image: eventDetails.image || null
        },
        postedBy: req.coordinatorId,
        timestamp: new Date()
      });
  
      const savedEvent = await newEvent.save();
  
      hub.events.push(savedEvent._id);
      await hub.save();
  
      return res.status(201).json({
        message: 'Announcement posted successfully',
        eventId: savedEvent._id
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  const coordinatorLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const coordinator = await Coordinator.findOne({ email });
        if (!coordinator) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, coordinator.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const JWT_SECRET = process.env.JWT_SECRET
        const token = jwt.sign({ coordinatorId: coordinator._id, email: coordinator.email, role:'coordinator' }, JWT_SECRET, {
            expiresIn: '1h'
        });

        res.cookie('coordinatortoken', token, {
            httpOnly: true,
            maxAge: 3600000, 
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });

        return res.status(200).json({ message: 'Login successful' , token, role: 'coordinator' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllCoordinators = async (req, res) => {
  try {
    const customHeader = req.headers['access-token'];
    if (!customHeader) {
      res.status(500).send('Headers not provided!');
    }

    if (customHeader === process.env.accessToken) {
      const coordinators = await Coordinator.find();
      res.status(200).json(coordinators);
    } else {
      res.status(500).send('Invalid Header value!');
    }
  } catch (error) {
    console.error('Error fetching Coordinators:', error);
    res.status(500).send('Server error');
  }
}

const updateCoordinator = async (req, res) => {
  const { name, email, password } = req.body;
  const { coordinatorId } = req.params;

  try {
    const customHeader = req.headers['access-token'];
    if (!customHeader) {
      throw new Error('Header not provided!');
    }
    const coordinator = await Coordinator.findById(coordinatorId);
    if (!coordinator) {
      return res.status(404).json({ message: 'Coordinator not found' });
    }
    if (customHeader === process.env.accessToken) {
      if (name) {
        coordinator.name = name;
      }
      if (email) {
        coordinator.email = email;
      }
      if (password) {
        coordinator.password = await bcrypt.hash(password, 10);
      }

      await coordinator.save();

      return res.status(200).json({ message: 'Coordinators details updated successfully' });
    } else {
      throw new Error('Invalid header value!');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteCoordinator = async (req, res) => {
  const { coordinatorId } = req.params;
  try {
    const customHeader = req.headers['access-token'];
    if (!customHeader) {
      throw new Error('Header not provided!');
    }
    if (customHeader === process.env.accessToken) {
      const coordinator = await Coordinator.findById(coordinatorId);
      if (!coordinator) {
        return res.status(404).json({ message: 'Coordinator not found' });
      }

      await Coordinator.findByIdAndDelete(coordinatorId);

      return res.status(200).json({ message: 'Coordinator deleted successfully' });
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

  console.log(email, role);
  
  try {
    const user = await Coordinator.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Coordinator not found' });
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

    const user = await Coordinator.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'Coordinator not found' });
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

module.exports = {changePassword, postEvent, coordinatorLogin, getAllCoordinators, updateCoordinator, deleteCoordinator,requestPasswordReset, resetPassword};
