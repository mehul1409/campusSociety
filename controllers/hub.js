const Hub = require('../models/hub');
const College = require('../models/college')
const Coordinator = require('../models/coordinator')

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
  const { hubName, collegeId, coordinatorId, coordinatorName } = req.body;
  const { hubId } = req.params;

  try {
    const customHeader = req.headers['access-token'];
    if (!customHeader) {
      return res.status(400).json({ message: 'Access token not provided!' });
    }

    const hub = await Hub.findById(hubId);
    const coordinator = await Coordinator.findById(coordinatorId);

    if (!hub) {
      return res.status(404).json({ message: 'Hub not found' });
    }

    if (!coordinator) {
      return res.status(404).json({ message: 'Coordinator not found' });
    }

    if (customHeader === process.env.accessToken) {
      if (hubName) hub.hubName = hubName;
      if (collegeId) hub.collegeId = collegeId;
      if (coordinatorId) hub.coordinatorId = coordinatorId;
      if (coordinatorName) {
        coordinator.name = coordinatorName;
        await coordinator.save();
      }
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

// const deleteHub = async (req, res) => {
//   const { hubId } = req.params;

//   try {
//     const customHeader = req.headers['access-token'];
//     if (!customHeader) {
//       return res.status(400).json({ message: 'Access token not provided!' });
//     }

//     if (customHeader === process.env.accessToken) {
//       // Find the hub
//       const hub = await Hub.findById(hubId);
//       const coordinatorId = hub.coordinatorId;
//       console.log(hub.coordinatorId)
//       if (!hub) {
//         return res.status(404).json({ message: 'Hub not found' });
//       }

//       // Delete the hub from the College schema
//       const collegeUpdateResult = await College.updateMany(
//         { hubs: hubId }, // Assuming `hubs` is an array of hub IDs in the College schema
//         { $pull: { hubs: hubId } }
//       );

//       if (collegeUpdateResult.modifiedCount > 0) {
//         console.log(`Hub ${hubId} removed from ${collegeUpdateResult.modifiedCount} colleges`);
//       } else {
//         console.log(`No colleges found with the hub ${hubId}`);
//       }

//       // Delete the coordinator associated with the hub
//       const coordinatorDeleteResult = await Coordinator.findOneAndDelete({ coordinatorId });
//       if (coordinatorDeleteResult) {
//         console.log(`Coordinator for hub ${hubId} deleted successfully`);
//       } else {
//         console.log(`No coordinator found for hub ${hubId}`);
//       }

//       // Delete the hub from the Hub schema
//       await Hub.findByIdAndDelete(hubId);

//       return res.status(200).json({ message: 'Hub and associated coordinator deleted successfully' });
//     } else {
//       return res.status(403).json({ message: 'Unauthorized access!' });
//     }
//   } catch (error) {
//     console.error('Error deleting hub:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };



module.exports = {
  getAllHubs,
  updateHub,
  deleteHub
};
