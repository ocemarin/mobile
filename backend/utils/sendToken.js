const sendToken = (user, statusCode, res) => {
  const token = user.generateAuthToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };

  console.log("token ", token);
  // res.status(statusCode).cookie('token', token, options).json({
  //     success: true,
  //     user
  // })
  // Set the response headers manually with Set-Cookie
  res
    .status(statusCode)
    .setHeader("Set-Cookie", `token=${token}; ${options}`)
    .json({
      success: true,
      user,
    });
};

module.exports = sendToken;
