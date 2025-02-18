const mongoose = require('mongoose');

const mileageHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['earn', 'use'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: '',
    maxlength: 255
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: () => new Date(Date.now() + 9 * 60 * 60 * 1000)
  }
});

// 복합 인덱스 추가 (userId와 createdAt 기반)
mileageHistorySchema.index({userId: 1, createdAt: -1});

module.exports = mongoose.model('MileageHistory', mileageHistorySchema);
