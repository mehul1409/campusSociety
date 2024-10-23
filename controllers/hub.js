const Hub = require('../models/hub');

const getAllHubs = async (req, res) => {
  try {
    const customHeader = req.headers['access-token'];
    
    if (!customHeader) {
      return res.status(400).json({ message: 'Access token not provided!' });
    }

    if (customHeader === process.env.accessToken) {
      const hubs = await Hub.find().populate('collegeId').populate('coordinatorId').populate('events');
      res.status(200).json(hubs);
    } else {
      return res.status(403).json({ message: 'Unauthorized access!' });
    }
  } catch (error) {
    console.error('Error fetching hubs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateHub = async (req, res) => {
  const { hubName, collegeId, coordinatorId, events } = req.body;
  const { hubId } = req.params;

  try {
    const customHeader = req.headers['access-token'];
    if (!customHeader) {
      return res.status(400).json({ message: 'Access token not provided!' });
    }

    const hub = await Hub.findById(hubId);
    if (!hub) {
      return res.status(404).json({ message: 'Hub not found' });
    }

    if (customHeader === process.env.accessToken) {
      if (hubName) hub.hubName = hubName;
      if (collegeId) hub.collegeId = collegeId;
      if (coordinatorId) hub.coordinatorId = coordinatorId;
      if (events && Array.isArray(events)) hub.events = events;

      await hub.save();
      return res.status(200).json({ message: 'Hub details updated successfully' });
    } else {
      return res.status(403).json({ message: 'Unauthorized access!' });
    }
  } catch (error) {
    console.error('Error updating hub:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteHub = async (req, res) => {
  const { hubId } = req.params;
  
  try {
    const customHeader = req.headers['access-token'];
    if (!customHeader) {
      return res.status(400).json({ message: 'Access token not provided!' });
    }

    if (customHeader === process.env.accessToken) {
      const hub = await Hub.findById(hubId);
      if (!hub) {
        return res.status(404).json({ message: 'Hub not found' });
      }

      await Hub.findByIdAndDelete(hubId);
      return res.status(200).json({ message: 'Hub deleted successfully' });
    } else {
      return res.status(403).json({ message: 'Unauthorized access!' });
    }
  } catch (error) {
    console.error('Error deleting hub:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllHubs,
  updateHub,
  deleteHub
};
