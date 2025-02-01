const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  token: {type: String, required: true},
  createdAt: {type: Date, default: Date.now},
  expiresAt: {type: Date, required: true}
});

// TTL Index를 사용하여 만료된 토큰 자동 삭제
RefreshTokenSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
