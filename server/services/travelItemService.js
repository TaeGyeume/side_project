const TravelItem = require('../models/TravelItem');

// ✅ 상품 생성 서비스
exports.createTravelItem = async data => {
  const newItem = new TravelItem(data);
  return await newItem.save();
};

// 🔹 최상위 카테고리 조회 (parentCategory가 null인 항목)
exports.getTopLevelCategories = async () => {
  try {
    const topLevelCategories = await TravelItem.find({parentCategory: null});
    return topLevelCategories;
  } catch (error) {
    throw new Error('최상위 카테고리를 가져오는 중 오류 발생: ' + error.message);
  }
};

// 🔹 특정 카테고리의 하위 카테고리 조회
exports.getSubCategories = async categoryId => {
  try {
    const subCategories = await TravelItem.find({parentCategory: categoryId});
    return subCategories;
  } catch (error) {
    throw new Error('하위 카테고리를 가져오는 중 오류 발생: ' + error.message);
  }
};

// 🔹 특정 카테고리의 상품 조회
exports.getItemsByCategory = async categoryId => {
  try {
    const items = await TravelItem.find({
      parentCategory: categoryId,
      price: {$exists: true}
    });
    return items;
  } catch (error) {
    throw new Error('카테고리 내 상품을 가져오는 중 오류 발생: ' + error.message);
  }
};

// 🔹 모든 카테고리 조회 (parentCategory 이름 포함)
exports.getAllCategories = async () => {
  try {
    const categories = await TravelItem.find({})
      .populate('parentCategory', 'name') // 🔹 parentCategory의 `name` 필드만 가져옴
      .select('name parentCategory subCategories');

    return categories;
  } catch (error) {
    throw new Error('❌ 모든 카테고리를 불러오는 중 오류 발생: ' + error.message);
  }
};
