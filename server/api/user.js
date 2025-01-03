// routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 경로 설정
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);

module.exports = router;