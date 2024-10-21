const Coordinator = require('../models/coordinator.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Hub = require('../models/hub.js');
const Event = require('../models/event.js');

const changePassword = async (req, res) => {
    const { coordinatorId, currentPassword, newPassword } = req.body;

    try {
        const coordinator = await Coordinator.findById(coordinatorId);
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
    const { hubId, eventDetails } = req.body;
    
    try {
      const hub = await Hub.findById(hubId);
      if (!hub) {
        return res.status(404).json({ message: 'Hub not found' });
      }
  
      const newEvent = new Event({
        hubId,
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
        // Find the coordinator by email
        const coordinator = await Coordinator.findOne({ email });
        if (!coordinator) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, coordinator.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const JWT_SECRET = process.env.JWT_SECRET
        const token = jwt.sign({ coordinatorId: coordinator._id, email: coordinator.email }, JWT_SECRET, {
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
};

module.exports = {changePassword, postEvent, coordinatorLogin};
