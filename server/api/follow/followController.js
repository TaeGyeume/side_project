const User = require("../../models/User");
const Follow = require('../../models/Follow');

// 팔로우 알림 목록 조회
exports.getIncomingFollowRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const incomingRequests = await Follow.find({
      followingId: userId,
      status: "PENDING",
    })
      .select("followerId followerUsername")
      .lean();

    console.log("Incoming Requests:", incomingRequests); // 응답 데이터 확인

    res.status(200).json({ incomingRequests });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch incoming follow requests.", error: err.message });
  }
};

// 요청 중인 팔로우 목록 조회
exports.getPendingRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const pendingRequests = await Follow.find({
      followerId: userId, // 요청자의 ID
      status: 'PENDING'  // 상태가 PENDING인 요청만 가져옴
    })
      .select('followingId followingUsername') // 필요한 필드만 반환
      .lean();

    res.status(200).json({ pendingRequests });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: "Failed to fetch pending follow requests." });
  }
};

// 팔로우 요청 생성
exports.createFollow = async (req, res) => {
  const { followerId, followingId } = req.body;

  if (!followerId || !followingId) {
    return res.status(400).json({ message: "followerId and followingId are required" });
  }

  try {
    // 중복 요청 확인
    const existingFollow = await Follow.findOne({ followerId, followingId });

    if (existingFollow) {
      return res.status(200).json(existingFollow); // 기존 요청 반환
    }

    // `followerId`와 `followingId`에 해당하는 사용자 이름 조회
    const follower = await User.findById(followerId).select("username");
    const following = await User.findById(followingId).select("username");

    if (!follower || !following) {
      return res.status(404).json({ message: "User not found" });
    }

    const follow = new Follow({
      followerId,
      followerUsername: follower.username,
      followingId,
      followingUsername: following.username,
    });

    await follow.save();
    res.status(201).json(follow);
  } catch (error) {
    console.error("Error creating follow:", error);
    res.status(500).json({ message: "Failed to create follow" });
  }
};

// 팔로우 요청 수락
exports.acceptFollow = async (req, res) => {
  try {
    const { followId } = req.params;

    const follow = await Follow.findByIdAndUpdate(
      followId,
      {
        status: 'ACCEPTED',
        updatedAt: Date.now() + 9 * 60 * 60 * 1000
      },
      { new: true }
    );

    if (!follow) {
      return res.status(404).json({ message: 'Follow request not found.' });
    }

    res.status(200).json({ message: 'Follow request accepted.', follow });
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept follow request.', error: err.message });
  }
};

// 팔로우 요청 거절
exports.rejectFollow = async (req, res) => {
  try {
    const followId = req.params.followId.trim(); // 불필요한 공백 제거

    const follow = await Follow.findByIdAndUpdate(
      followId,
      {
        status: 'REJECTED',
        updatedAt: Date.now() + 9 * 60 * 60 * 1000
      },
      { new: true }
    );

    if (!follow) {
      return res.status(404).json({ message: 'Follow request not found.' });
    }

    res.status(200).json({ message: 'Follow request rejected.', follow });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject follow request.', error: err.message });
  }
};

// 팔로워 목록 조회
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const followers = await Follow.find({ followingId: userId, status: 'ACCEPTED' })
      .select('followerId')
      .lean();

    res.status(200).json({ followers });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch followers.', error: err.message });
  }
};

// 팔로잉 목록 조회
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const followings = await Follow.find({ followerId: userId, status: 'ACCEPTED' })
      .select('followingId')
      .lean();

    res.status(200).json({ followings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch following.', error: err.message });
  }
};