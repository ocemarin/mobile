const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const Relationship = require('../models/Relationship');
const User = require('../models/User');

exports.getRelationships = catchAsyncErrors(async (req, res, next) => {
    const followedId = req.params.userId;
    if (followedId === req.user.id) return next(new ErrorHandler("User's don't have relation with own", 400));

    const followedUser = await User.findById(followedId);
    if (!followedUser) return next(new ErrorHandler("User not found", 404));

    const relationship = await Relationship.findOne({
        followerId: req.user.id,
        followedId
    })

    if (relationship) {

        res.status(201).json({
            success: true,
            isFollowed: true
        })
    } else {
        res.status(200).json({
            success: true,
            isFollowed: false
        })
    }
})

exports.addRelationship = catchAsyncErrors(async (req, res, next) => {
    const followedId = req.params.userId;
    if (followedId === req.user.id) return next(new ErrorHandler("User's don't have relation with own", 400));

    const followedUser = User.findById(followedId);
    if (!followedUser) return next(new ErrorHandler("User not found", 404));

    const isFollowed = await Relationship.findOne({
        followerId: req.user.id,
        followedId
    })
    if (isFollowed) return next(new ErrorHandler("User already followed", 400));

    await Relationship.create({
        followedId,
        followerId: req.user.id
    });

    res.status(201).json({
        success: true,
        isFollowed: true
    })
})

exports.deleteRelationship = catchAsyncErrors(async (req, res, next) => {
    const followedId = req.params.userId;
    if (followedId === req.user.id) return next(new ErrorHandler("User's don't have relation with own", 400));
    
    const followedUser = User.findById(followedId);
    if (!followedUser) return next(new ErrorHandler("User not found", 404));

    const relationship = await Relationship.findOne({
        followerId: req.user.id,
        followedId
    })
    if (!relationship) return next(new ErrorHandler("User not followed", 400));

    await relationship.deleteOne();

    res.status(201).json({
        success: true,
        message: "Relationship deleted",
        isFollowed: false
    })

})