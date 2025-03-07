const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/User");
const sendToken = require("../utils/sendToken");

// User registration validation function
function validateRegistration(userData) {
  const errors = {};
  
  // Email validation
  if (userData.email) {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.email = "Please enter a valid email address";
    }
  }
  
  // Phone validation
  if (userData.phone) {
    // Regular expression for phone numbers (adjust based on your requirements)
    // This example allows digits, spaces, dashes, parentheses, and plus sign
    const phoneRegex = /^[\d\s\-+()]+$/;
    if (!phoneRegex.test(userData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
  }
  
  return errors;
}

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
  if (req.body.email) {
    userData.email = req.body.email;
  } else if (req.body.phone) {
    userData.phone = req.body.phone;
  } else {
    return next(new ErrorHandler("Please provide either email or phone", 400));
  }

  const validationErrors = validateRegistration(userData);
  
  if (Object.keys(validationErrors).length > 0) {
    // Return errors to the user
    return res.status(400).json({
      success: false,
      errors: validationErrors
    });
  }

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
