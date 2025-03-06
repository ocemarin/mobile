const express = require("express");
const { getRelationships, addRelationship, deleteRelationship } = require("../controllers/relationship");
const { isAuthenticated } = require('../middlewares/authMiddleware');


const router = express.Router()

router.route("/relationship/:userId").get(isAuthenticated, getRelationships).post(isAuthenticated, addRelationship).delete(isAuthenticated, deleteRelationship);


module.exports = router;