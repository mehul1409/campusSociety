const mongoose = require('mongoose');

const spocSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true
    },
});

const spoc = mongoose.model('Spoc', spocSchema);

module.exports = spoc;
