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

// ✅ 최하위 상품 목록 조회 컨트롤러
exports.getAllItemsController = async (req, res) => {
  try {
    const items = await travelItemService.getAllItems();
    res.status(200).json({items});
  } catch (error) {
    console.error('❌ 전체 상품 조회 실패:', error);
    res.status(500).json({message: '상품을 불러오는 중 오류 발생', error: error.message});
  }
};

// ✅ 특정 상품 정보 수정 (PATCH)
exports.updateTravelItemController = async (req, res) => {
  const {itemId} = req.params; // ✅ URL에서 상품 ID 가져오기
  const updateData = req.body; // ✅ 요청 본문에서 수정할 데이터 가져오기
  const newImages = req.files; // ✅ 업로드된 이미지 가져오기

  try {
    const updatedItem = await travelItemService.updateTravelItem(
      itemId,
      updateData,
      newImages
    );
    res.status(200).json({message: '✅ 상품 수정 성공', item: updatedItem});
  } catch (error) {
    res.status(400).json({message: '❌ 상품 수정 실패', error: error.message});
  }
};

// ✅ 특정 상품 조회 (ID 기준)
exports.getTravelItemByIdController = async (req, res) => {
  try {
    const {itemId} = req.params;
    const travelItem = await travelItemService.getTravelItemById(itemId);

    res.status(200).json(travelItem);
  } catch (error) {
    res.status(404).json({error: error.message});
  }
};

// ✅ 상품 삭제 컨트롤러 (DELETE)
exports.deleteTravelItemController = async (req, res) => {
  try {
    const {itemId} = req.params;
    const result = await travelItemService.deleteTravelItem(itemId);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

// ✅ 최상위 카테고리 수정 (PUT)
exports.updateTopLevelCategory = async (req, res) => {
  try {
    const {categoryId} = req.params;
    const updateData = req.body;

    const updatedCategory = await travelItemService.updateTopLevelCategory(
      categoryId,
      updateData
    );

    res.status(200).json({
      message: '최상위 카테고리 수정 성공',
      category: updatedCategory
    });
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// ✅ 특정 하위 카테고리 수정 (PUT)
exports.updateSubCategory = async (req, res) => {
  try {
    const {subCategoryId} = req.params;
    const updateData = req.body;

    const updatedSubCategory = await travelItemService.updateSubCategory(
      subCategoryId,
      updateData
    );

    res.status(200).json({
      message: '하위 카테고리 수정 성공',
      category: updatedSubCategory
    });
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// ✅ 특정 하위 카테고리 삭제 (DELETE)
exports.deleteCategory = async (req, res) => {
  try {
    const {categoryId} = req.params;

    await travelItemService.deleteCategory(categoryId);

    res.status(200).json({message: '카테고리 삭제 성공'});
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};
