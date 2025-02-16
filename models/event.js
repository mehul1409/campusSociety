const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    hubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hub',
        required: true
    },
    eventDetails: {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
    },
    media: [
        {
            url: {
                type: String,
                required: true
            },
            image: {
                type: String,
                required: true
            }
        }
    ],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coordinator',
        required: true
    },
    timestamp: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
