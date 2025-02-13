const Favorite = require('../models/Favorite');
const Accommodation = require('../models/Accommodation');
const TourTicket = require('../models/TourTicket');
const TravelItem = require('../models/TravelItem');

// 즐겨찾기 추가 또는 삭제
const toggleFavorite = async (userId, itemId, itemType) => {
  try {
    let item;

    // 아이템 타입에 따라 아이템을 처리
    if (itemType === 'Accommodation') {
      item = await Accommodation.findById(itemId);
    } else if (itemType === 'TourTicket') {
      item = await TourTicket.findById(itemId);
    } else if (itemType === 'TravelItem') {
      item = await TravelItem.findById(itemId);
    } else {
      throw new Error('Invalid item type');
    }

    if (!item) {
      throw new Error('Item not found');
    }

    // 즐겨찾기 아이템이 이미 존재하는지 확인
    const existingFavorite = await Favorite.findOne({
      user: userId,
      item: itemId,
      itemType: itemType
    });

    if (existingFavorite) {
      // 이미 즐겨찾기된 아이템이면 제거
      await Favorite.deleteOne({_id: existingFavorite._id});
      return {message: 'Favorite removed successfully'};
    } else {
      // 즐겨찾기된 아이템이 아니면 추가
      const favorite = new Favorite({
        user: userId,
        item: itemId,
        itemType: itemType
      });

      await favorite.save();
      return {message: 'Favorite added successfully', favorite};
    }
  } catch (error) {
    console.error('Error in toggleFavorite service:', error);
    throw error;
  }
};

// 사용자 즐겨찾기 목록 조회
const getUserFavorites = async userId => {
  try {
    const favorites = await Favorite.find({user: userId})
      .populate('item') // 아이템 정보도 함께 조회
      .exec();

    return favorites;
  } catch (error) {
    console.error('Error fetching user favorites:', error.message);
    throw new Error('Error fetching user favorites');
  }
};

module.exports = {
  toggleFavorite,
  getUserFavorites // 이 부분을 추가합니다
};
