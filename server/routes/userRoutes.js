const express = require("express");
const { createUser, getUsers } = require("../controllers/userController");
const router = express.Router();

router.post("/", createUser); // POST /api/users
router.get("/", getUsers);   // GET /api/users

module.exports = router;