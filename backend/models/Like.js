const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "post"
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    }
}, { timestamps: true });

const Like = mongoose.model("like", likeSchema);

module.exports = Like;