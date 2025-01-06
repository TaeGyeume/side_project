const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 사용자 목록 조회
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "사용자 목록 조회 중 오류가 발생했습니다." });
    }
};

// 사용자 정보 조회
exports.getMyInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        res.status(200).json({
            username: user.username,
            name: user.name,
            email: user.email,
            phone: user.phone,
            gender: user.gender,
            birthdate: user.birthdate,
            profileImage: user.profileImage  || "/uploads/default-profile.png",
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 기본이미지 삭제할시 디폴트 이미지변경
exports.resetProfileImage = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // 기존 이미지 삭제
        if (user.profileImage && user.profileImage !== "/uploads/default-profile.png") {
            const oldImagePath = path.join(__dirname, "..", user.profileImage);
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error("Error deleting old profile image:", err.message);
            });
        }

        // 기본 이미지 설정
        user.profileImage = "/uploads/default-profile.png";
        await user.save();

        res.status(200).json({ message: "Profile image reset to default", profileImage: user.profileImage });
    } catch (error) {
        res.status(500).json({ message: "Error resetting profile image" });
    }
};

// 프로필 이미지 업로드
exports.uploadProfileImage = [
    multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
            filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
        })
    }).single("profileImage"),
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: "User not found" });

            // 이전 이미지 삭제
            if (user.profileImage) {
                const oldImagePath = path.join(__dirname, "..", user.profileImage);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error("Error deleting old profile image:", err.message);
                });
            }

            const imagePath = `/uploads/${req.file.filename}`;
            user.profileImage = imagePath;
            await user.save();
            res.status(200).json({ message: "Profile image uploaded", profileImage: imagePath });
        } catch (error) {
            res.status(500).json({ message: "Error uploading profile image" });
        }
    },
];

// 사용자 정보 업데이트
exports.updateMyInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, gender, birthdate, bio } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, gender, birthdate, bio },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user info:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

