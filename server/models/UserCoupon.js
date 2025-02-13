const mongoose = require('mongoose');
const moment = require('moment-timezone');

const UserCouponSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // User 스키마 참조
      required: true
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon', // Coupon 스키마 참조
      required: true
    },
    issuedAt: {
      type: Date, // 쿠폰 발급 날짜 (KST로 저장)
      default: () => moment().tz('Asia/Seoul').toDate()
    },
    expiresAt: {
      type: Date, // 쿠폰 만료일 (KST 변환 후 저장)
      required: true
    },
    isUsed: {
      type: Boolean, // 사용 여부
      default: false
    },
    createdAt: {
      type: Date,
      default: () => moment().tz('Asia/Seoul').toDate() // 생성 시 한국 시간 저장
    },
    updatedAt: {
      type: Date,
      default: () => moment().tz('Asia/Seoul').toDate() // 업데이트 시 한국 시간 저장
    }
  },
  {
    timestamps: false, // MongoDB 자동 타임스탬프 비활성화
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
);

// 📌 **저장 전 한국 시간 변환 (`save` Hook)**
UserCouponSchema.pre('save', function (next) {
  this.issuedAt = moment().tz('Asia/Seoul').toDate();
  this.expiresAt = moment(this.expiresAt).tz('Asia/Seoul').toDate();
  this.createdAt = moment().tz('Asia/Seoul').toDate();
  this.updatedAt = moment().tz('Asia/Seoul').toDate();
  next();
});

// 📌 **업데이트 시 한국 시간 변환 (`updateOne` Hook)**
UserCouponSchema.pre('updateOne', function (next) {
  this.set({updatedAt: moment().tz('Asia/Seoul').toDate()});
  next();
});

// 📌 **조회 시 KST 변환된 값 제공 (Virtual 필드)**
UserCouponSchema.virtual('issuedAtKST').get(function () {
  return moment(this.issuedAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
});
UserCouponSchema.virtual('createdAtKST').get(function () {
  return moment(this.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
});
UserCouponSchema.virtual('updatedAtKST').get(function () {
  return moment(this.updatedAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
});

module.exports = mongoose.model('UserCoupon', UserCouponSchema);
