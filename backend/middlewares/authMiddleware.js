const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");

const isAuthenticated = async (req, res, next) => {
  const token  =  req.headers.authorization?.split(" ")[1] || req.cookies.token;
  if (!token || !req.cookies) {
    return next(new ErrorHandler("Please Login to access this resource.", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decodedData.id);

  if (!user) {
    return next(new ErrorHandler("Please Login to access this resource.", 401));
  }
  req.user = user;
  next();
};

module.exports = { isAuthenticated };

