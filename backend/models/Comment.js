const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    desc: {
        type: String,
        required: true,
        trim: true
    },
    postId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "post"
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    },
    audioId: {
        type: mongoose.Types.ObjectId,
        optional: true,
        ref:"audio"
    }
}, { timestamps: true });

const Comment = mongoose.model("comment", commentSchema);

module.exports = Comment;