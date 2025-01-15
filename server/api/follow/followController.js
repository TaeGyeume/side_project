const followService = require('../../services/followService');
const Follow = require("../../models/Follow");
const User = require('../../models/User');

// 나를 팔로우 하는 사람 목록
exports.getFollowers = async (req, res) => {
  const { userId } = req.params;

  try {
    const followers = await Follow.find({ followingId: userId, status: "ACCEPTED" })
      .populate("followerId", "username _id")
      .lean();

    // 평탄화 처리
    const formattedFollowers = followers.map((follow) => ({
      _id: follow._id, // Follow 관계의 고유 ID
      followerId: follow.followerId._id, // 평탄화된 followerId
      username: follow.followerId.username, // 사용자 이름
      status: follow.status, // 상태 (ACCEPTED)
    }));

    res.json(formattedFollowers); // 평탄화된 데이터를 반환
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "Failed to fetch followers." });
  }
};

// 내가 팔로우 하는 사람 목록
exports.getFollowings = async (req, res) => {
  const { userId } = req.params;

  try {
    const followings = await Follow.find({ followerId: userId, status: "ACCEPTED" }) // 조건 확인
      .populate("followingId", "username _id") // `username`과 `_id`를 가져옴
      .lean();

    if (!followings) {
      console.log("No followings found");
      return res.status(404).json({ message: "No followings found" });
    }

    console.log("Followings fetched:", followings);

    // 평탄화 처리
    const formattedFollowings = followings.map((follow) => ({
      _id: follow._id, // Follow의 고유 ID
      followingId: follow.followingId._id, // 평탄화된 followingId
      username: follow.followingId.username, // 사용자 이름
      status: follow.status, // 상태 (ACCEPTED)
    }));

    res.json(formattedFollowings); // 응답으로 반환
  } catch (error) {
    console.error("Error fetching followings:", error);
    res.status(500).json({ message: "Failed to fetch followings." });
  }
};

exports.createFollow = async (req, res) => {
  const { followerId, followingId } = req.body;

  if (!followerId || !followingId) {
    return res.status(400).json({ message: "followerId and followingId are required" });
  }

  try {
    const follow = await followService.createFollow(followerId, followingId);
    res.status(201).json(follow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIncomingFollowRequests = async (req, res) => {
  const { userId } = req.params;

  try {
    const incomingRequests = await followService.getIncomingFollowRequests(userId);
    res.status(200).json({ incomingRequests });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch incoming follow requests.", error: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  const { userId } = req.params;

  try {
    const pendingRequests = await followService.getPendingRequests(userId);
    res.status(200).json({ pendingRequests });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending follow requests.", error: error.message });
  }
};

exports.acceptFollow = async (req, res) => {
  const { followId } = req.params;

  try {
    const follow = await followService.updateFollowStatus(followId, "ACCEPTED");
    res.status(200).json({ message: "Follow request accepted.", follow });
  } catch (error) {
    res.status(500).json({ message: "Failed to accept follow request.", error: error.message });
  }
};

exports.rejectFollow = async (req, res) => {
  const { followId } = req.params;

  try {
    const result = await followService.rejectFollowRequest(followId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to reject follow request.", error: error.message });
  }
};

// 팔로우 삭제
exports.deleteFollow = async (req, res) => {
  const { followId } = req.params;

  console.log("Received followId:", followId); // 전달된 followId 확인

  // followId가 없거나 잘못된 경우 처리
  if (!followId || followId === "undefined") {
    return res.status(400).json({ message: "Invalid follow ID." });
  }

  try {
    const result = await followService.deleteFollow(followId);

    if (!result) {
      return res.status(404).json({ message: "Follow relationship not found." });
    }

    res.status(200).json({ message: "Follow deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete follow.", error: error.message });
  }
};

// 전체 사용자와 팔로우 상태 조회
exports.getAllUsersWithFollowStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    // 전체 사용자 조회
    const allUsers = await User.find().lean();

    // 팔로우 데이터를 가져오면서 followingId를 평탄화
    const followings = await Follow.find({ followerId: userId })
      .populate("followingId", "_id username") // 필요한 필드만 가져옴
      .lean();

    // 평탄화된 followingId로 매핑
    const followingMap = {};
    followings.forEach((f) => {
      followingMap[f.followingId._id] = {
        status: f.status,
        followId: f._id, // Follow 관계의 _id
      };
    });

    // 사용자 데이터와 팔로우 상태를 매핑
    const usersWithStatus = allUsers.map((user) => ({
      ...user,
      isFollowing: followingMap[user._id]?.status === "ACCEPTED",
      status: followingMap[user._id]?.status || null,
      followId: followingMap[user._id]?.followId || null, // followId 포함
    }));

    res.json(usersWithStatus);
  } catch (error) {
    console.error("Error fetching users with follow status:", error);
    res.status(500).json({ message: "Failed to fetch users with follow status." });
  }
};