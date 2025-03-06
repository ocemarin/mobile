const express = require("express");
const { login, register, logout, getUser } = require("../controllers/auth");
const { isAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router()

router.route("/login").post( login);
router.route("/register").post( register);
router.route("/logout").get(logout);
router.route("/me").get( isAuthenticated, getUser);

module.exports = router;