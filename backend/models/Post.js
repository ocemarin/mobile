const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    desc: {
        type: String,
        required: true,
        trim: true
    },
    images: {
        public_id: String,
        url: String
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    }
}, { timestamps: true });

const Post = mongoose.model("post", postSchema);

module.exports = Post;