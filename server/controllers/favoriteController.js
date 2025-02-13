const favoriteService = require('../services/favoriteService');

// 즐겨찾기 추가 또는 삭제
const toggleFavorite = async (req, res) => {
  try {
    const {itemId, itemType} = req.body;
    const userId = req.user.id; // 사용자 ID 가져오기

    if (!userId) {
      return res.status(400).json({error: 'User ID is required'});
    }

    const result = await favoriteService.toggleFavorite(userId, itemId, itemType);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

// 사용자 즐겨찾기 목록 조회 (populate 적용)
const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id; // 사용자 ID 가져오기

    // 서비스 계층에서 populate 적용하여 아이템 정보 포함
    const favorites = await favoriteService.getUserFavorites(userId);

    res.status(200).json({favorites});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

module.exports = {
  toggleFavorite,
  getUserFavorites
};
