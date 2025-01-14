const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId, // ObjectId로 변경
      ref: "User", // 참조하는 모델
      required: true,
    },
    followerUsername: {
      type: String,
      required: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId, // ObjectId로 변경
      ref: "User", // 참조하는 모델
      required: true,
    },
    followingUsername: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    createdAt: {
      type: Date,
      default: () => new Date(Date.now() + 9 * 60 * 60 * 1000), // KST
    },
    updatedAt: {
      type: Date,
      default: () => new Date(Date.now() + 9 * 60 * 60 * 1000), // KST
    },
  },
  { timestamps: false }
);

// 중복 팔로우 요청 방지
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

module.exports = mongoose.model("Follow", followSchema);