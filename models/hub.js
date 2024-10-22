const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
    hubName: {
        type: String,
        required: true
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true
    },
    coordinatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coordinator',
        required: true
    },
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
});

const hub = mongoose.model('Hub', hubSchema);

module.exports = hub
