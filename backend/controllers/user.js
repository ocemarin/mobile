const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const User = require("../models/User.js");
const getDataUri = require('../utils/getDataUri');
const cloudinary = require('cloudinary').v2;

exports.getUser = catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user
    })
})

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, city, website, password } = req.body;
    const images = req.files;

    const user = await User.findByIdAndUpdate(req.user.id, {
        $set: {
            name,
            email,
            city,
            website
        }
    }, { new: true, runValidators: true });

    if (password) {
        user.password = password;
    }

    await Promise.all(images.map(async (image) => {
        if (image.fieldname === "profilePic") {
            const profileUri = getDataUri(image);

            const myCloud = await cloudinary.uploader.upload(profileUri.content, {
                folder: '/social/profile',
                crop: "scale",
            })

            if (user.profilePic.public_id) {
                await cloudinary.uploader.destroy(user.profilePic.public_id);
            }

            user.profilePic = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }

        }

        if (image.fieldname === "coverPic") {
            const coverUri = getDataUri(image);

            const myCloud = await cloudinary.uploader.upload(coverUri.content, {
                folder: '/social/cover',
                crop: "scale",
            })

            if (user.coverPic.public_id) {
                await cloudinary.uploader.destroy(user.coverPic.public_id);
            }

            user.coverPic = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }

        }

        return;
    }))

    await user.save();
    res.status(200).json({
        success: true,
        user
    })
})
