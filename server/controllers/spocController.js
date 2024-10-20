const College = require('../models/college.js');
const Coordinator = require('../models/coordinator.js');
const Hub = require('../models/hub.js')
const Spoc = require('../models/spoc.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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

    return res.status(201).json({ message: 'SPOC assigned successfully', spocId: savedSpoc._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

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
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {assignSpoc,changePassword, createHub};
