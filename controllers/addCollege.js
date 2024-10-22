const college = require('../models/college.js');

const addCollege = async (req,res) => {
    try {
        const { collegeName, location } = req.body;
        const newCollege = new college({
            collegeName,
            location
        });
        const savedCollege = await newCollege.save();
        return res.status(201).json({
            message: 'College added successfully',
            collegeId: savedCollege._id
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = addCollege;
