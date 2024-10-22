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
});

const coordinator = mongoose.model('Coordinator', coordinatorSchema);

module.exports = coordinator;