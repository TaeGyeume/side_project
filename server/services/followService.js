const Follow = require('../models/Follow');
const User = require('../models/User');

const createFollow = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw new Error("You cannot follow yourself.");
  }

  const existingFollow = await Follow.findOne({ followerId, followingId });
  if (existingFollow) {
    return existingFollow; // 기존 요청 반환
  }

  const follower = await User.findById(followerId).select("username");
  const following = await User.findById(followingId).select("username");

  if (!follower || !following) {
    throw new Error("User not found.");
  }

  const follow = new Follow({
    followerId,
    followerUsername: follower.username,
    followingId,
    followingUsername: following.username,
  });

  return follow.save();
};

const getIncomingFollowRequests = async (userId) => {
  return Follow.find({ followingId: userId, status: "PENDING" }).select("followerId followerUsername").lean();
};

const getPendingRequests = async (userId) => {
  return Follow.find({ followerId: userId, status: "PENDING" }).select("followingId followingUsername").lean();
};

const updateFollowStatus = async (followId, status) => {
  const follow = await Follow.findByIdAndUpdate(
    followId,
    {
      status,
      updatedAt: Date.now() + 9 * 60 * 60 * 1000,
    },
    { new: true }
  );

  if (!follow) {
    throw new Error("Follow request not found.");
  }

  return follow;
};

const deleteFollowRequest = async (followId) => {
  // followId에 해당하는 데이터 찾기
  const follow = await Follow.findById(followId);

  if (!follow) {
    throw new Error("Follow request not found.");
  }

  // 상태가 PENDING인지 확인
  if (follow.status !== "PENDING") {
    throw new Error("Only PENDING follow requests can be deleted.");
  }

  // 데이터 삭제
  await Follow.findByIdAndDelete(followId);

  return { message: "Follow request successfully deleted." };
};

module.exports = {
  createFollow,
  getIncomingFollowRequests,
  getPendingRequests,
  updateFollowStatus,
  deleteFollowRequest,
};