const mongoose = require('mongoose');

const coordinatorSchema = new mongoose.Schema({
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
    hubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hub'
    },
});

const coordinator = mongoose.model('Coordinator', coordinatorSchema);

module.exports = coordinator;
