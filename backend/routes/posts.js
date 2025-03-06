const express = require("express");
const { getPosts, addPost, deletePost } = require("../controllers/post");
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { singleImage } = require('../middlewares/imageUpload');

const router = express.Router();

router.route("/posts").get(isAuthenticated, getPosts)
router.route("/post/new").post(isAuthenticated,singleImage("post"), addPost)
router.route("/post/:id").delete(isAuthenticated, deletePost);

module.exports = router;
