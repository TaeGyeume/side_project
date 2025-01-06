const User = require("../models/User");

// 전체 사용자 조회
exports.getAllUsers = async () => {
  return await User.find();
};

// 특정 사용자 조회
exports.getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

// 사용자 추가
exports.addUser = async (userData) => {
  const { username, email } = userData;

  // 중복 사용자 확인
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new Error("Username or Email already exists");
  }

  // 사용자 생성
  const newUser = new User(userData);
  return await newUser.save();
};
