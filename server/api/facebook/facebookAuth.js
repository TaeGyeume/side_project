const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../user/userModel'); // MongoDB User 모델
require("dotenv").config({ path: __dirname + "/.env" }); // .env 파일이 server 디렉토리에 있는 경우


const router = express.Router();

// POST /api/facebook/login
router.post('/login', async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ message: 'Access token is required' });
  }

  try {
    // 1. Facebook Graph API 호출
    const response = await axios.get(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email`
    );

    const { id, name, email } = response.data;

    if (!id || !email) {
      return res.status(400).json({ message: 'Failed to retrieve user info from Facebook' });
    }

    // 2. 사용자 확인 또는 회원가입 처리
    let user = await User.findOne({ facebookId: id });

    if (!user) {
      // 새로운 사용자 생성
      user = new User({
        facebookId: id,
        username: name || 'Unknown User',
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await user.save();
    }

    // 3. JWT 생성
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, message: 'Facebook login successful' });
  } catch (error) {
    console.error('Facebook login error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
