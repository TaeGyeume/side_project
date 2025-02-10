const travelItemService = require('../services/travelItemService');

// ✅ 여행용품 생성 (이미지 업로드 포함)
exports.createTravelItem = async (req, res) => {
  try {
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : []; // 업로드된 이미지 경로 저장
    const newItemData = {...req.body, images};

    const newItem = await travelItemService.createTravelItem(newItemData);

    res.status(201).json({
      message: '상품이 성공적으로 등록되었습니다.',
      item: newItem
    });
  } catch (error) {
    res.status(500).json({message: '상품 등록 중 오류 발생', error: error.message});
  }
};

// 🔹 최상위 카테고리 조회
exports.getTopLevelCategories = async (req, res) => {
  try {
    const topLevelCategories = await travelItemService.getTopLevelCategories();
    res.status(200).json({topLevelCategories});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// 🔹 특정 카테고리의 하위 카테고리 조회
exports.getSubCategories = async (req, res) => {
  try {
    const {categoryId} = req.params;
    const subCategories = await travelItemService.getSubCategories(categoryId);

    res.status(200).json({subCategories});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// 🔹 특정 카테고리의 상품 조회
exports.getItemsByCategory = async (req, res) => {
  try {
    const {categoryId} = req.params;
    const items = await travelItemService.getItemsByCategory(categoryId);

    res.status(200).json({items});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// 🔹 모든 카테고리 조회 컨트롤러
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await travelItemService.getAllCategories();
    res.status(200).json({categories});
  } catch (error) {
    console.error('❌ 카테고리 조회 실패:', error);
    res.status(500).json({message: '카테고리를 불러오는 중 오류가 발생했습니다.'});
  }
};
