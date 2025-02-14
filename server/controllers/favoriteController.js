const favoriteService = require('../services/favoriteService');

// 즐겨찾기 추가 또는 삭제
const toggleFavorite = async (req, res) => {
  try {
    let {itemId, itemType} = req.body;
    const userId = req.user.id;

    console.log(
      `📩 Received request - userId: ${userId}, itemId: ${itemId}, itemType: ${itemType}`
    );

    if (!userId) {
      return res.status(400).json({error: 'User ID is required'});
    }

    if (!itemId || !itemType) {
      return res.status(400).json({error: 'itemId and itemType are required'});
    }

    // 🚀 `itemType.toLowerCase()`를 적용하지 않음 (대소문자 그대로 유지)
    console.log(`🔍 Processed itemType: ${itemType}`);

    const result = await favoriteService.toggleFavorite(userId, itemId, itemType);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error toggling favorite:', error.message);
    res.status(400).json({error: error.message});
  }
};

// 사용자 즐겨찾기 목록 조회 (populate 적용)
const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id; // 사용자 ID 가져오기

    console.log(`📥 Fetching favorites for user: ${userId}`); // ✅ 디버깅 로그 추가

    // 서비스 계층에서 populate 적용하여 아이템 정보 포함
    const favorites = await favoriteService.getUserFavorites(userId);

    res.status(200).json({favorites});
  } catch (error) {
    console.error('❌ Error fetching user favorites:', error.message);
    res.status(400).json({error: error.message});
  }
};

module.exports = {
  toggleFavorite,
  getUserFavorites
};
