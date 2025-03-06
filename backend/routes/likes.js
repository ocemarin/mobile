const express = require("express");
const { getLikes, addLike, deleteLike } = require("../controllers/like");
const { isAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router()

router.route("/post/:id/like").get(isAuthenticated, getLikes).post(isAuthenticated, addLike).delete(isAuthenticated, deleteLike)


module.exports = router;