const mongoose = require('mongoose');

const TravelItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String, // 카테고리명 (예: 여행용품, 여행 액세서리)
    required: true
  },
  subCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TravelItem' // 🔹 자기 자신을 참조 (하위 카테고리)
    }
  ],
  price: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number, // 재고
    default: 0
  },
  soldOut: {
    type: Boolean,
    default: false
  },
  images: [
    {
      type: String // 🔹 이미지 URL 리스트
    }
  ],
  rating: {
    type: Number,
    default: 0
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TravelItem', // 🔹 상위 카테고리 (없으면 최상위)
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ `category` 값을 `parentCategory`와 동일하게 설정
TravelItemSchema.pre('save', function (next) {
  if (this.parentCategory && !this.category) {
    this.category = this.parentCategory;
  }
  next();
});

// ✅ `subCategories` 자동 업데이트 기능 추가
TravelItemSchema.post('save', async function (doc, next) {
  if (doc.parentCategory) {
    await mongoose.model('TravelItem').findByIdAndUpdate(
      doc.parentCategory,
      {$addToSet: {subCategories: doc._id}}, // ✅ `subCategories` 배열에 추가
      {new: true}
    );
  }
  next();
});

// ✅ 상품이 저장될 때 재고(stock) 확인 후 품절(soldOut) 처리
TravelItemSchema.pre('save', function (next) {
  this.soldOut = this.stock === 0;
  next();
});

// ✅ 상품이 업데이트될 때도 재고 확인해서 품절 처리
TravelItemSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.stock !== undefined) {
    update.soldOut = update.stock === 0;
  }
  next();
});

module.exports = mongoose.model('TravelItem', TravelItemSchema);
