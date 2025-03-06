const mongoose = require('mongoose');

const relationshipSchema = new mongoose.Schema({
    followerId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    },
    followedId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    }
}, { timestamps: true });

const Relationship = mongoose.model("relationship", relationshipSchema);

module.exports = Relationship;