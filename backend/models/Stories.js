const mongoose = require('mongoose');

const storiesSchema = new mongoose.Schema({
    image: {
        public_id: String,
        url: String
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    }
}, { timestamps: true });

const Stories = mongoose.model("stories", storiesSchema);

module.exports = Stories;