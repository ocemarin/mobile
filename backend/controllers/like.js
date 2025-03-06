const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const Post = require("../models/Post");
const Like = require("../models/Like");
const Audio = require("../models/audio");

exports.getLikes = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    const audio = await Audio.findById(req.params.id);
    if (!audio) {
      return next(new ErrorHandler("Post/Audio not found", 404));
    }
    const likes = await Like.find({
      postId: audio.id,
    });

    return res.status(201).json({
      success: true,
      likes,
    });
  }

  const likes = await Like.find({
    postId: post.id,
  });

  return res.status(201).json({
    success: true,
    likes,
  });
});

exports.addLike = catchAsyncErrors(async (req, res, next) => {
  console.log("req ", req.user);
  const post = await Post.findById(req.params.id);
  console.log("post ", post);
  if (!post) {
    const audio = await Audio.findById(req.params.id);
    if (!audio) {
      return next(new ErrorHandler("Audio/Post not found", 404));
    }
    const isLiked = await Like.findOne({
      audioId: audio.id,
      userId: req.user.id,
    });

    if (isLiked) return next(new ErrorHandler("Audio already liked", 404));

    await Like.create({
      postId: audio.id,
      userId: req.user.id,
    });

    const likes = await Like.find({
      postId: audio.id,
    });

    res.status(201).json({
      success: true,
      likes,
    });
  }

  const isLiked = await Like.findOne({
    postId: post.id ? post.id : post._id,
    userId: req.user.id ? req.user.id : req.user._id,
  });

  if (isLiked) return next(new ErrorHandler("Post already liked", 404));

  await Like.create({
    postId: post._id,
    userId: req.user.id,
  });

  const likes = await Like.find({
    postId: post.id,
  });

  res.status(201).json({
    success: true,
    likes,
  });
});

exports.deleteLike = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    const audio = await Audio.findById(req.params.id);
    if (!audio) {
      return next(new ErrorHandler("Post not found", 404));
    }
    const like = await Like.findOne({
      postId: audio.id,
      userId: req.user.id,
    });

    if (!like) return next(new ErrorHandler("Audio wasn't liked", 404));

    await like.deleteOne();

    const likes = await Like.find({
      postId: audio.id,
    });

    res.status(201).json({
      success: true,
      message: "Unliked audio",
      likes,
    });
  }

  const like = await Like.findOne({
    postId: post.id,
    userId: req.user.id,
  });
  console.log("like ", like);
  if (!like) return next(new ErrorHandler("Post wasn't liked", 404));

  await like.deleteOne();

  const likes = await Like.find({
    postId: post.id,
  });

  res.status(201).json({
    success: true,
    message: "Unliked post",
    likes,
  });
});
