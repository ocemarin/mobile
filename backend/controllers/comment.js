const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Audio = require("../models/audio");

exports.getComments = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    const audio = await Audio.findById(req.params.postId);
    if (!audio) {
      return next(new ErrorHandler("Post/Audio not found", 404));
    }
    const comments = await Comment.find({
      postId: audio.id,
    })
      .populate("userId")
      .populate("audioId");

    return res.status(200).json({
      success: true,
      comments,
    });
  }

  const comments = await Comment.find({
    postId: post.id,
  })
    .populate("userId")
    .populate("audioId");

  return res.status(200).json({
    success: true,
    comments,
  });
});

exports.addComment = catchAsyncErrors(async (req, res, next) => {
  const desc = req.body.desc;
  if (!desc) return next(new ErrorHandler("Please add description", 400));

  const post = await Post.findById(req.params.postId);
  if (!post) {
    const audio = await Audio.findById(req.params.postId);
    if (!audio) {
      return next(new ErrorHandler("Post/Audio not found", 404));
    }
    await Comment.create({
      postId: audio.id,
      desc,
      userId: req.user.id,
      audioId: req.body.audio ? req.body.audio : null,
    });

    const comments = await Comment.find({
      postId: audio.id,
    })
      .populate("userId")
      .populate("audioId")
      .lean();
    return res.status(200).json({
      success: true,
      comments,
    });
  }

  await Comment.create({
    postId: post.id,
    desc,
    userId: req.user.id,
    audioId: req.body.audio ? req.body.audio : null,
  });

  const comments = await Comment.find({
    postId: post.id,
  })
    .populate("userId")
    .populate("audioId");

  return res.status(200).json({
    success: true,
    comments,
  });
});

exports.deleteComment = catchAsyncErrors(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return next(new ErrorHandler("Comment not found", 404));

  await comment.deleteOne();

  res.status(200).json({
    success: true,
    message: "Comment deleted",
  });
});
