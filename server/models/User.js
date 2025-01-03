const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  birthdate: { type: Date, required: true },
  followers: [{ type: String }], // 팔로워 사용자 ID 배열
  following: [{ type: String }], // 팔로우한 사용자 ID 배열
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

module.exports = User;