const mongoose = require('mongoose');
const moment = require('moment-timezone');

const CouponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true
    },
    maxDiscountAmount: {
      type: Number,
      default: 0, // ✅ 정액 할인 시 기본값 0
      validate: {
        validator: function (value) {
          return this.discountType === 'percentage' ? value >= 0 : true;
        },
        message: '퍼센트 할인 쿠폰만 maxDiscountAmount를 설정할 수 있습니다.'
      }
    },
    minPurchaseAmount: {
      type: Number,
      default: 0
    },
    applicableMemberships: {
      type: [String],
      enum: ['길초보', '길잡이', '모험왕'],
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      default: () => moment().tz('Asia/Seoul').toDate()
    },
    updatedAt: {
      type: Date,
      default: () => moment().tz('Asia/Seoul').toDate()
    }
  },
  {
    timestamps: false,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
);

// 📌 **저장 전 데이터 검증 및 기본값 설정**
CouponSchema.pre('save', function (next) {
  this.createdAt = moment().tz('Asia/Seoul').toDate();
  this.updatedAt = moment().tz('Asia/Seoul').toDate();

  // ✅ 정액 할인(`fixed`)일 경우 `maxDiscountAmount`를 강제로 `0`으로 설정
  if (this.discountType === 'fixed') {
    this.maxDiscountAmount = 0;
  }

  next();
});

// 📌 **업데이트 시 `updatedAt` 자동 변경**
CouponSchema.pre('updateOne', function (next) {
  this.set({updatedAt: moment().tz('Asia/Seoul').toDate()});
  next();
});

// 📌 **조회 시 KST 변환된 날짜 제공**
CouponSchema.virtual('createdAtKST').get(function () {
  return moment(this.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
});

CouponSchema.virtual('updatedAtKST').get(function () {
  return moment(this.updatedAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
});

module.exports = mongoose.model('Coupon', CouponSchema);
