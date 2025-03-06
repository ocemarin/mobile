const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const Post = require("../models/Post.js");
const Comment = require("../models/Comment");
const getDataUri = require("../utils/getDataUri");
const Audio = require("../models/audio");
const cloudinary = require("cloudinary").v2;

exports.getPosts = catchAsyncErrors(async (req, res) => {
  const [post, audios] = await Promise.all([
    Post.find().populate("userId"),
    Audio.find({ desc: { $exists: true } }).populate("userId"),
  ]);
  const posts = [...post, ...audios];
  res.status(200).json({
    success: true,
    posts,
  });
});

exports.addPost = catchAsyncErrors(async (req, res, next) => {
  console.log("in add posts", req);
  const desc = req.body.desc;
  let image;
  if (req.file) {
    image = req.file;
  }else{
    image = req.body.file
  }

  console.log("req file ", req.body);
  console.log("request user ", req.user);
  const post = await Post.create({
    desc,
    userId: req.user._id,
  });

  if (image) {
    console.log("image ", image);
    const imageUri = getDataUri(image);
    console.log("image url ", imageUri);
    const myCloud = await cloudinary.uploader.upload(imageUri.content, {
      folder: "/social/post",
      crop: "scale",
    });

    post.images = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };

    await post.save();
  }

  await post.populate("userId");

  res.status(201).json({
    success: true,
    post,
  });
});

exports.deletePost = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    const audio = await Audio.findById(req.params.id); // Await the Audio.findById function

    if (!audio) {
      return next(new ErrorHandler("Post not found", 404));
    }

    if (audio.userId.toString() !== req.user.id) {
      return next(new ErrorHandler("Not authorized to delete the post", 403));
    }

    const comments = await Comment.find({
      audioId: audio._id,
    });

    if (audio.audio.public_id) {
      await cloudinary.uploader.destroy(audio.audio.public_id);
    }

    await Promise.all(
      comments.map(async (comment) => {
        await comment.deleteOne();
      })
    );

    await audio.deleteOne();
  } else {
    if (post.userId.toString() !== req.user.id) {
      return next(new ErrorHandler("Not authorized to delete the post", 403));
    }

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
  }

  res.status(200).json({
    success: true,
    message: "Post deleted",
  });
});
