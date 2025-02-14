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
      ref: 'travelItem' // 🔹 자기 자신을 참조 (하위 카테고리)
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
    ref: 'travelItem', // 🔹 상위 카테고리 (없으면 최상위)
    default: null
  },
  views: {
    type: Number,
    default: 0
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
    await mongoose.model('travelItem').findByIdAndUpdate(
      doc.parentCategory,
      {$addToSet: {subCategories: doc._id}}, // ✅ `subCategories` 배열에 추가
      {new: true}
    );
  }
  next();
});

// ✅ 상품이 삭제될 때 부모 카테고리에서도 자동 제거
TravelItemSchema.post('findOneAndDelete', async function (doc) {
  if (doc.parentCategory) {
    await mongoose.model('travelItem').findByIdAndUpdate(
      doc.parentCategory,
      {$pull: {subCategories: doc._id}}, // ✅ `subCategories` 배열에서 제거
      {new: true}
    );

    // ✅ 부모 카테고리에 더 이상 서브카테고리가 없으면 삭제
    const parentCategory = await mongoose
      .model('travelItem')
      .findById(doc.parentCategory);
    if (parentCategory && parentCategory.subCategories.length === 0) {
      await mongoose.model('travelItem').findByIdAndDelete(parentCategory._id);
      console.log(`🗑 부모 카테고리 자동 삭제됨: ${parentCategory._id}`);
    }
  }
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

module.exports = mongoose.model('travelItem', TravelItemSchema);
