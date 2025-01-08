const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    followerId: {
      type: String,
      required: true,
    },
    followerUsername: { // 팔로우 요청자의 사용자 이름
      type: String,
      required: true,
    },
    followingId: {
      type: String,
      required: true,
    },
    followingUsername: { // 팔로우 대상의 사용자 이름
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    regDate: {
      type: Date,
      default: Date.now,
    },
    modDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 중복 팔로우 요청 방지
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

module.exports = mongoose.model("Follow", followSchema);