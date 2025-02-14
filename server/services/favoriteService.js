const mongoose = require('mongoose');
const Favorite = require('../models/Favorite'); // ✅ 대소문자 확인
const Accommodation = require('../models/Accommodation');
const TourTicket = require('../models/TourTicket');
const TravelItem = require('../models/TravelItem');

// ✅ 정확한 itemType을 유지하기 위해 대소문자를 맞춘 modelMap
const modelMap = {
  accommodation: Accommodation,
  tourTicket: TourTicket, // ✅ 정확한 대소문자 사용
  travelItem: TravelItem
};

// 즐겨찾기 추가 또는 삭제 (토글 기능 포함)
const toggleFavorite = async (userId, itemId, itemType) => {
  try {
    console.log(
      `🔍 toggleFavorite called with: userId=${userId}, itemId=${itemId}, itemType=${itemType}`
    );

    // ✅ 클라이언트에서 변환한 itemType을 그대로 사용
    if (!modelMap[itemType]) {
      throw new Error(
        `Invalid item type received: ${itemType}. Expected one of: ${Object.keys(modelMap).join(', ')}`
      );
    }

    // 해당 아이템이 존재하는지 확인
    const item = await modelMap[itemType].findById(itemId);
    if (!item) {
      throw new Error(`Item not found: ${itemId} in ${itemType}`);
    }

    // 이미 즐겨찾기에 있는지 확인
    const existingFavorite = await Favorite.findOne({
      user: userId,
      item: itemId,
      itemType
    });

    if (existingFavorite) {
      // ✅ 이미 존재하면 삭제 (토글 기능)
      await Favorite.deleteOne({_id: existingFavorite._id});
      console.log(`🗑️ Removed from favorites: ${itemId} (${itemType})`);
      return {message: 'Favorite removed successfully'};
    } else {
      // ✅ 존재하지 않으면 추가
      const favorite = new Favorite({user: userId, item: itemId, itemType});
      await favorite.save();
      console.log(`⭐ Added to favorites: ${itemId} (${itemType})`);
      return {message: 'Favorite added successfully', favorite};
    }
  } catch (error) {
    console.error('❌ Error in toggleFavorite service:', error.message);
    throw error;
  }
};

// 사용자 즐겨찾기 목록 조회 (populate 적용)
const getUserFavorites = async userId => {
  try {
    console.log(`📥 Fetching favorites for user: ${userId}`);

    const favorites = await Favorite.find({user: userId})
      .populate({
        path: 'item',
        select: 'title images price location'
      })
      .exec();

    // 응답 데이터 가공
    const formattedFavorites = favorites.map(fav => ({
      _id: fav._id,
      itemType: fav.itemType,
      title: fav.item?.title || 'No Title',
      location: fav.item?.location || 'Unknown',
      price: fav.item?.price || 0,
      images: fav.item?.images || []
    }));

    return formattedFavorites;
  } catch (error) {
    console.error('❌ Error fetching user favorites:', error.message);
    throw new Error('Error fetching user favorites');
  }
};

module.exports = {
  toggleFavorite,
  getUserFavorites
};
