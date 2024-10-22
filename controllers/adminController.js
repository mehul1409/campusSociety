const College = require('../models/college.js');
const Spoc = require('../models/spoc.js');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

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

module.exports = { assignSpoc };