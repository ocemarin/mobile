const express = require("express");
const { getComments, addComment, deleteComment } = require("../controllers/comment");
const { isAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route("/post/:postId/comment").get(isAuthenticated, getComments).post(isAuthenticated, addComment);
router.route("/comment/:id").delete(isAuthenticated, deleteComment);

module.exports = router;