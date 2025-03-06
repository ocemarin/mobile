const express = require("express");
const { getPosts, addPost, deletePost } = require("../controllers/post");
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { singleImage } = require('../middlewares/imageUpload');
const {getAudio, addAudio} = require("../controllers/audio");
const { singleAudio } = require("../middlewares/audioUpload");

const router = express.Router();

router.route("/audios").get(isAuthenticated, getAudio)
router.route("/audio/new").post(isAuthenticated,singleAudio("audio"), addAudio)
// router.route("/post/:id").delete(isAuthenticated, deletePost);

module.exports = router;
