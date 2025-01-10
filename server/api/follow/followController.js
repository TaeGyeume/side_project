const followService = require('../../services/followService');

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
    const result = await followService.deleteFollowRequest(followId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to reject follow request.", error: error.message });
  }
};