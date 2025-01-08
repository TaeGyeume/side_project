const Follow = require('../../models/Follow');

// 팔로우 요청 생성
exports.createFollow = async (req, res) => {
    try {
        const { followerId, followingId } = req.body;

        // 팔로우 중복 체크
        const existingFollow = await Follow.findOne({ followerId, followingId });
        if (existingFollow) {
            return res.status(400).json({ message: 'Already following this user.' });
        }

        const follow = new Follow({ followerId, followingId });
        await follow.save();

        res.status(201).json({ message: 'Follow request sent.', follow });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create follow request.', error: err.message });
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