const mongoose = require('mongoose');

// Follow Schema 정의
const followSchema = new mongoose.Schema(
    {
        followerId: {
            type: String,
            required: true,
        },
        followingId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
            default: 'PENDING',
        },
        regDate: {
            type: Date,
            default: Date.now,
        },
        modDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Follow', followSchema);
