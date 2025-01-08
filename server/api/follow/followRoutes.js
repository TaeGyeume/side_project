const express = require('express');
const router = express.Router();
const followController = require('./followController');

// 팔로우 요청 생성
router.post('/create', followController.createFollow);

// 팔로우 요청 수락
router.put('/accept/:followId', followController.acceptFollow);

// 팔로우 요청 거절
router.put('/reject/:followId', followController.rejectFollow);

// 팔로워 목록 조회
router.get('/followers/:userId', followController.getFollowers);

// 팔로잉 목록 조회
router.get('/following/:userId', followController.getFollowing);

module.exports = router;