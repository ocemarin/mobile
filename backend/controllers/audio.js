const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const Post = require("../models/Post.js");
const Comment = require("../models/Comment");
const getDataUri = require("../utils/getDataUri");
const cloudinary = require("cloudinary").v2;
const Audio = require("../models/audio.js");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.getAudio = catchAsyncErrors(async (req, res) => {
  const audios = await Audio.find().populate("userId");

  res.status(201).json({
    success: true,
    audios,
  });
});

exports.addAudio = catchAsyncErrors(async (req, res, next) => {
  console.log("in ad audio ", req);
  const desc = req.body.desc;
  const audioFile = req.file;
  const audio = await Audio.create({
    desc,
    userId: req.user.id,
  });

  if (audio) {
    const audioUrl = getDataUri(audioFile);
    const myCloud = await cloudinary.uploader.upload(audioUrl.content, {
      resource_type: "auto",
      folder: "/social/audio",
      crop: "scale",
    });
    audio.audio = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };

    await audio.save();
  }

  await audio.populate("userId");

  res.status(201).json({
    success: true,
    audio,
  });
});

exports.deletePost = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) return next(new ErrorHandler("Post not found", 404));
  if (post.userId.toString() !== req.user.id)
    return next(new ErrorHandler("Not authorized to delete the post", 403));

  const comments = await Comment.find({
    postId: post.id,
  });

  if (post.images.public_id) {
    await cloudinary.uploader.destroy(post.images.public_id);
  }

  await Promise.all(
    comments.map(async (comment) => {
      await comment.deleteOne();
    })
  );
  await post.deleteOne();

  res.status(200).json({
    success: true,
    message: "Post deleted",
  });
});
