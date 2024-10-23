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

const getAllColleges = async (req, res) => {
    try {
      const customHeader = req.headers['access-token'];
      if (!customHeader) {
        res.status(500).send('Headers not provided!');
      }
  
      if (customHeader === process.env.accessToken) {
        const colleges = await college.find();
        res.status(200).json(colleges);
      } else {
        res.status(500).send('Invalid Header value!');
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
      res.status(500).send('Server error');
    }
  }
  
  const updateCollege = async (req, res) => {
    const { collegeName, location } = req.body;
    const { collegeId} = req.params;
  
    try {
      const customHeader = req.headers['access-token'];
      if (!customHeader) {
        throw new Error('Header not provided!');
      }
      const collegedetail = await college.findById(collegeId);
      if (!collegedetail) {
        return res.status(404).json({ message: 'college not found' });
      }
      if (customHeader === process.env.accessToken) {
        if (collegeName) {
            collegedetail.collegeName = collegeName;
        }
        if (location) {
            collegedetail.location = location;
        }
  
        await collegedetail.save();
  
        return res.status(200).json({ message: 'college details updated successfully' });
      } else {
        throw new Error('Invalid header value!');
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
  const deleteCollege = async (req, res) => {
    const { collegeId } = req.params;
    try {
      const customHeader = req.headers['access-token'];
      if (!customHeader) {
        throw new Error('Header not provided!');
      }
      if (customHeader === process.env.accessToken) {
        const collegedetail = await college.findById(collegeId);
        if (!collegedetail) {
          return res.status(404).json({ message: 'college not found' });
        }
  
        await college.findByIdAndDelete(collegeId);
  
        return res.status(200).json({ message: 'college deleted successfully' });
      } else {
        throw new Error('Invalid header value!');
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

module.exports = {addCollege, getAllColleges, updateCollege, deleteCollege};
