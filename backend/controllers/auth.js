const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/User");
const sendToken = require("../utils/sendToken");

exports.register = catchAsyncErrors(async (req, res, next) => {
  // check if filled required fields
  if (!req.body.name || !req.body.password || (!req.body.email && !req.body.phone)) {
    return next(new ErrorHandler("Please fill all the required fields", 400));
  }

  // Create user with provided fields
  const userData = {
    name: req.body.name,
    password: req.body.password,
  };

  // Add email or phone if provided
  if (req.body.email) userData.email = req.body.email;
  if (req.body.phone) userData.phone = req.body.phone;

  const user = await User.create(userData);

  sendToken(user, 201, res);
});

exports.login = catchAsyncErrors(async (req, res, next) => {
  // Check if password and either email or phone is provided
  if ((!req.body.email && !req.body.phone) || !req.body.password) {
    return res.status(400).json({
      success: false,
      message: "Please provide your email or phone number and password"
    });
  }

  let user;
  
  // Find user by email or phone
  if (req.body.email) {
    user = await User.findOne({ email: req.body.email }).select("+password");
  } else if (req.body.phone) {
    user = await User.findOne({ phone: req.body.phone }).select("+password");
  }

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const isMatch = await user.comparePassword(req.body.password);

  if (!isMatch) {
    return next(new ErrorHandler("Password incorrect"));
  }

  console.log('is matched ', isMatch);
  sendToken(user, 200, res);
});

exports.logout = catchAsyncErrors((req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

exports.getUser = catchAsyncErrors(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});
