const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/User");
const sendToken = require("../utils/sendToken");

exports.register = catchAsyncErrors(async (req, res, next) => {
  // check if filled every field
  if (!req.body.name || !req.body.password || !req.body.email) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  const user = await User.create({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
  });

  sendToken(user, 201, res);
});

exports.login = catchAsyncErrors(async (req, res, next) => {
  // check if filled every field
  if (!req.body.email || !req.body.password) {
    return res.status(400).json("Please fill all the fields");
  }

  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );
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
