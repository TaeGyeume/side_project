const User = require("../../models/User");
const Follow = require('../../models/Follow');

// 요청 중인 팔로우 목록 조회
exports.getPendingRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("User ID for pending requests:", userId); // 요청된 userId 확인

    const pendingRequests = await Follow.find({
      followerId: userId, // 요청자의 ID
      status: 'PENDING'  // 상태가 PENDING인 요청만 가져옴
    })
      .select('followingId followingUsername') // 필요한 필드만 반환
      .lean();

    console.log("Pending Requests:", pendingRequests); // 쿼리 결과 확인

    res.status(200).json({ pendingRequests });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: "Failed to fetch pending follow requests." });
  }
};

// 팔로우 요청 생성
exports.createFollow = async (req, res) => {
  console.log("Request body:", req.body); // 요청 데이터 확인

  const { followerId, followingId } = req.body;

  if (!followerId || !followingId) {
    return res.status(400).json({ message: "followerId and followingId are required" });
  }

  try {
    // 중복 요청 확인
    const existingFollow = await Follow.findOne({ followerId, followingId });

    if (existingFollow) {
      return res.status(400).json({ message: "Follow request already exists" });
    }

    // `followerId`와 `followingId`에 해당하는 사용자 이름 조회
    const follower = await User.findById(followerId).select("username");
    const following = await User.findById(followingId).select("username");

    if (!follower || !following) {
      return res.status(404).json({ message: "User not found" });
    }

    const follow = new Follow({
      followerId,
      followerUsername: follower.username, // 요청자 이름 저장
      followingId,
      followingUsername: following.username, // 대상자 이름 저장
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
      { status: 'ACCEPTED', modDate: Date.now() },
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
      { status: 'REJECTED', modDate: Date.now() },
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