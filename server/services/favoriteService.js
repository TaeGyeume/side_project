const mongoose = require('mongoose');
const Favorite = require('../models/favorite');
const Accommodation = require('../models/Accommodation');
const TourTicket = require('../models/TourTicket');
const TravelItem = require('../models/TravelItem');

// 모델 매핑 (각 itemType과 mongoose 모델 연결)
const modelMap = {
  Accommodation,
  tourTicket: TourTicket,
  TravelItem
};

// 즐겨찾기 추가 또는 삭제
const toggleFavorite = async (userId, itemId, itemType) => {
  try {
    let item;

    // itemType에 맞는 모델에서 item 찾기
    if (!modelMap[itemType]) {
      throw new Error('Invalid item type');
    }
    item = await modelMap[itemType].findById(itemId);

    if (!item) {
      throw new Error('Item not found');
    }

    // 즐겨찾기 여부 확인
    const existingFavorite = await Favorite.findOne({
      user: userId,
      item: itemId,
      itemType
    });

    if (existingFavorite) {
      // 즐겨찾기 삭제
      await Favorite.deleteOne({_id: existingFavorite._id});
      return {message: 'Favorite removed successfully'};
    } else {
      // 즐겨찾기 추가
      const favorite = new Favorite({user: userId, item: itemId, itemType});
      await favorite.save();
      return {message: 'Favorite added successfully', favorite};
    }
  } catch (error) {
    console.error('Error in toggleFavorite service:', error);
    throw error;
  }
};

// 사용자 즐겨찾기 목록 조회 (populate 적용)
const getUserFavorites = async userId => {
  try {
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
    console.error('Error fetching user favorites:', error.message);
    throw new Error('Error fetching user favorites');
  }
};

module.exports = {
  toggleFavorite,
  getUserFavorites
};
