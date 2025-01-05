const express = require("express");
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

router.get("/me", verifyToken, userController.getMyInfo);
router.post("/me/profile-image", verifyToken, userController.uploadProfileImage);
router.get("/", verifyToken, userController.getUsers);

module.exports = router;
