const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema({
  collegeName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  spocId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Spoc',
    default: null,
  },
  hubs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hub',
    }
  ],
});

const collegeSchema = mongoose.model('College', CollegeSchema);

module.exports = collegeSchema;
