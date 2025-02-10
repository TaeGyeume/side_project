const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  email: {type: String, required: true},
  code: {type: String, required: true},
  expiresAt: {type: Date, required: true}, // index 속성 제거
  used: {type: Boolean, default: false}
});

// TTL 설정 (5분 후 자동 삭제)
VerificationSchema.index({expiresAt: 1}, {expireAfterSeconds: 300}); // 인덱스 정의만 하나로 남겨둠

module.exports = mongoose.model('Verification', VerificationSchema);
