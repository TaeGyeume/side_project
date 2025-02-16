const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const {Accommodation, TourTicket, TravelItem} = require('../models');

// ✅ 정확한 itemType을 유지하기 위한 modelMap
const modelMap = {
  Accommodation: Accommodation,
  TourTicket: TourTicket,
  TravelItem: TravelItem
};

// ✅ itemType 변환 함수 (소문자로 변환 후 매핑)
const normalizeItemType = itemType => {
  if (typeof itemType === 'string') {
    const mapping = {
      accommodation: 'Accommodation',
      tourticket: 'TourTicket',
      travelitem: 'TravelItem'
    };

    const lowercasedType = itemType.toLowerCase();
    return mapping[lowercasedType] || itemType;
  }
  return itemType;
};

// ✅ 즐겨찾기 추가 또는 삭제 (토글 기능 포함)
const toggleFavorite = async (userId, itemId, itemType) => {
  try {
    itemType = normalizeItemType(itemType);
    console.log(
      `🔍 toggleFavorite called with: userId=${userId}, itemId=${itemId}, itemType=${itemType}`
    );

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
      await Favorite.deleteOne({_id: existingFavorite._id});
      console.log(`🗑️ Removed from favorites: ${itemId} (${itemType})`);
      return {message: 'Favorite removed successfully'};
    } else {
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

// ✅ 사용자 즐겨찾기 목록 조회 (populate 적용)
const getUserFavorites = async userId => {
  try {
    console.log(`📥 Fetching favorites for user: ${userId}`);

    const favorites = await Favorite.find({user: userId})
      .populate({
        path: 'item',
        select: 'title name images price minPrice location' // ✅ Accommodation의 name 포함, minPrice를 price로 변환
      })
      .lean();

    console.log(`✅ Retrieved favorites for user ${userId}:`, favorites);

    return favorites.map(fav => ({
      _id: fav._id,
      itemType: fav.itemType,
      itemId: fav.item?._id || null,
      title: fav.item?.title || fav.item?.name || 'No Title', // ✅ title이 없으면 name 사용
      location: fav.item?.location || 'Unknown',
      price: fav.item?.price || fav.item?.minPrice || 0, // ✅ Accommodation은 minPrice 사용
      images: fav.item?.images || []
    }));
  } catch (error) {
    console.error('❌ Error fetching user favorites:', error.message);
    throw new Error('Error fetching user favorites');
  }
};

module.exports = {
  toggleFavorite,
  getUserFavorites
};
