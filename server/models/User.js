const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // 사용자 이름 예: USER13912
  password: { type: String }, // 일반 회원가입 시 암호화된 비밀번호
  email: { type: String, unique: true }, // 이메일 주소
  phone: { type: String, unique: true }, // 전화번호
  facebookId: { type: String, sparse: true, default: null }, // Facebook 로그인용 ID
  bio: { type: String }, // 사용자 소개 (예: "사진과 추억을 공유합니다")
  profileImage: { type: String }, // 프로필 사진 URL
  name: { type: String },          // 이름 예: 유재석
  gender: { type: String },        // 'male' or 'female'
  birthdate: { type: Date },       // 생년월일
  // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // 팔로워 목록
  // following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // 팔로잉 목록
  created_at: { type: Date, default: Date.now }, // 생성 날짜
  updated_at: { type: Date, default: Date.now }, // 업데이트 날짜
  isFacebookUser: { type: Boolean, default: false }, // Facebook 사용자인지 여부
});

const User = mongoose.model("User", userSchema);

module.exports = User;
