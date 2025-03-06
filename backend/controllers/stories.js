const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const Stories = require('../models/Stories');
const cloudinary = require('cloudinary').v2;
const getDataUri = require('../utils/getDataUri');

exports.getStories = catchAsyncErrors(async (req, res, next) => {
    const stories = await Stories.find().populate("userId");

    res.status(201).json({
        success: true,
        stories
    })
})

exports.addStory = catchAsyncErrors(async (req, res, next) => {
    if (!req.file) return next(new ErrorHandler("Please upload image", 400));
    const imageUri = getDataUri(req.file);

    const myCloud = await cloudinary.uploader.upload(imageUri.content, {
        folder: '/social/story',
        crop: "scale",
    })

    await Stories.create({
        image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        },
        userId: req.user.id
    })

    const stories = await Stories.find().populate("userId");

    res.status(201).json({
        success: true,
        stories
    })
})

exports.deleteStory = catchAsyncErrors(async (req, res, next) => {
    const story = await Stories.findById(req.params.id);
    if (!story) return next(new ErrorHandler("Story not found", 404));

    if (story.userId.toString() !== req.user.id) {
        return next(new ErrorHandler("You aren't authorized to delete this story"));
    }

    await cloudinary.uploader.destroy(story.image.public_id);
    await story.deleteOne();
    const stories = await Stories.find().populate("userId");

    res.status(200).json({
        success: true,
        stories
    })
})
