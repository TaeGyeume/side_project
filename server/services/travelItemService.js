const TravelItem = require('../models/TravelItem');
const fs = require('fs');
const path = require('path');

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

// ✅ 최하위 카테고리 상품 조회 (모든 상품 중 subCategories가 없는 항목)
exports.getAllItems = async () => {
  try {
    const items = await TravelItem.find({
      subCategories: {$size: 0}, // ✅ 하위 카테고리가 없는 항목만 필터링
      price: {$exists: true} // ✅ 상품(카테고리 X)만 포함
    });

    return items;
  } catch (error) {
    throw new Error('모든 상품을 가져오는 중 오류 발생: ' + error.message);
  }
};

// ✅ 상품 수정 서비스 (PATCH)
exports.updateTravelItem = async (itemId, updateData, newImages) => {
  try {
    const item = await TravelItem.findById(itemId);
    if (!item) {
      throw new Error('해당 상품을 찾을 수 없습니다.');
    }

    console.log('🔍 기존 이미지 목록:', item.images);
    console.log('🗑 삭제 요청된 이미지 목록 (원본):', updateData.removeImages);

    // ✅ removeImages가 문자열로 전달될 경우 JSON 배열로 변환
    let imagesToRemove = [];
    if (typeof updateData.removeImages === 'string') {
      try {
        imagesToRemove = JSON.parse(updateData.removeImages); // JSON 배열 변환
      } catch (error) {
        imagesToRemove = [updateData.removeImages.trim().replace(/^"|"$/g, '')]; // 수동으로 변환
      }
    } else if (Array.isArray(updateData.removeImages)) {
      imagesToRemove = updateData.removeImages.map(img =>
        img.trim().replace(/^"|"$/g, '')
      );
    }

    console.log('🗑 최종 삭제할 이미지 목록:', imagesToRemove);

    // ✅ 기존 이미지 삭제 (updateData에 removeImages 배열이 있을 경우)
    if (imagesToRemove.length > 0) {
      imagesToRemove.forEach(imagePath => {
        const fileName = path.basename(imagePath); // 파일명만 추출
        const filePath = path.join(__dirname, '../uploads', fileName); // 업로드 폴더의 실제 경로

        console.log(`🗑 삭제 시도: ${filePath}`);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ 파일 삭제 완료: ${filePath}`);
        } else {
          console.log(`❌ 파일을 찾을 수 없음: ${filePath}`);
        }
      });

      // ✅ DB에서도 삭제 (이미지 URL 리스트에서 해당 파일 제거)
      item.images = item.images.filter(
        img => !imagesToRemove.includes(img.trim().replace(/^"|"$/g, ''))
      );
      console.log('🔄 업데이트된 이미지 목록:', item.images);
    }

    // ✅ 새로운 이미지 추가
    if (newImages && newImages.length > 0) {
      const newImagePaths = newImages.map(file => `/uploads/${file.filename}`);
      item.images.push(...newImagePaths);
      console.log('📸 추가된 이미지 목록:', newImagePaths);
    }

    // ✅ 나머지 상품 정보 업데이트
    Object.assign(item, updateData);

    // ✅ 변경사항 저장
    await item.save();
    console.log('✅ 상품 정보 업데이트 완료:', item);

    return item;
  } catch (error) {
    console.error('❌ 상품 수정 중 오류 발생:', error.message);
    throw new Error('상품 수정 중 오류 발생: ' + error.message);
  }
};

// ✅ 특정 상품 조회 (ID 기준) + 조회수 증가
exports.getTravelItemById = async itemId => {
  try {
    const travelItem = await TravelItem.findByIdAndUpdate(
      itemId,
      {$inc: {views: 1}}, // ✅ 조회수 1 증가
      {new: true} // ✅ 업데이트된 문서 반환
    ).populate({
      path: 'parentCategory', // ✅ `parentCategory` 필드 가져오기
      select: 'name parentCategory', // ✅ `name`과 `parentCategory` 필드 포함
      populate: {
        // ✅ `parentCategory`의 `parentCategory`도 가져오기
        path: 'parentCategory',
        select: 'name'
      }
    });

    if (!travelItem) {
      throw new Error('해당 상품을 찾을 수 없습니다.');
    }

    console.log('✅ 조회된 상품 데이터 (조회수 증가 적용됨):', travelItem); // ✅ 로그 출력

    return travelItem;
  } catch (error) {
    throw new Error('상품을 가져오는 중 오류 발생: ' + error.message);
  }
};

// ✅ 상품 삭제 서비스 (DELETE)
exports.deleteTravelItem = async itemId => {
  try {
    const item = await TravelItem.findById(itemId);
    if (!item) {
      throw new Error('해당 상품을 찾을 수 없습니다.');
    }

    console.log('🗑 삭제할 상품 정보:', item);

    const categoryId = item.parentCategory; // ✅ 상위 카테고리 ID

    // ✅ 상품에 포함된 이미지 삭제
    if (item.images && item.images.length > 0) {
      item.images.forEach(imagePath => {
        const fileName = path.basename(imagePath);
        const filePath = path.join(__dirname, '../uploads', fileName);

        console.log(`🗑 이미지 삭제 시도: ${filePath}`);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ 파일 삭제 완료: ${filePath}`);
        } else {
          console.log(`❌ 파일을 찾을 수 없음: ${filePath}`);
        }
      });
    }

    // ✅ DB에서 해당 상품 삭제
    await TravelItem.findByIdAndDelete(itemId);
    console.log(`✅ 상품 삭제 완료 (ID: ${itemId})`);

    // ✅ 부모 카테고리에서 해당 상품 제거
    if (categoryId) {
      await TravelItem.findByIdAndUpdate(
        categoryId,
        {$pull: {subCategories: itemId}}, // ✅ `subCategories` 배열에서 제거
        {new: true}
      );

      console.log(`✅ 부모 카테고리에서 삭제된 상품 제거: ${itemId}`);

      // ✅ 부모 카테고리에 더 이상 서브카테고리가 없으면 삭제
      const parentCategory = await TravelItem.findById(categoryId);
      if (parentCategory && parentCategory.subCategories.length === 0) {
        await TravelItem.findByIdAndDelete(categoryId);
        console.log(`🗑 부모 카테고리 삭제됨: ${categoryId}`);
      }
    }

    return {message: '상품 삭제 성공'};
  } catch (error) {
    console.error('❌ 상품 삭제 중 오류 발생:', error.message);
    throw new Error('상품 삭제 중 오류 발생: ' + error.message);
  }
};

// ✅ 최상위 카테고리 수정 (ID 기준)
exports.updateTopLevelCategory = async (categoryId, updateData) => {
  try {
    const category = await TravelItem.findOne({
      _id: categoryId,
      parentCategory: null // 최상위 카테고리만 검색
    });

    if (!category) {
      throw new Error('해당 최상위 카테고리를 찾을 수 없습니다.');
    }

    Object.assign(category, updateData);
    await category.save();

    console.log(`✅ 최상위 카테고리 수정 완료: ${categoryId}`);
    return category;
  } catch (error) {
    console.error('❌ 최상위 카테고리 수정 중 오류 발생:', error.message);
    throw new Error('최상위 카테고리 수정 중 오류 발생: ' + error.message);
  }
};

// ✅ 특정 카테고리의 하위 카테고리 수정
exports.updateSubCategory = async (subCategoryId, updateData) => {
  try {
    const subCategory = await TravelItem.findById(subCategoryId);

    if (!subCategory) {
      throw new Error('해당 하위 카테고리를 찾을 수 없습니다.');
    }

    Object.assign(subCategory, updateData);
    await subCategory.save();

    console.log(`✅ 하위 카테고리 수정 완료: ${subCategoryId}`);
    return subCategory;
  } catch (error) {
    console.error('❌ 하위 카테고리 수정 중 오류 발생:', error.message);
    throw new Error('하위 카테고리 수정 중 오류 발생: ' + error.message);
  }
};

// ✅ 특정 카테고리 삭제 (하위 카테고리도 삭제)
exports.deleteCategory = async categoryId => {
  try {
    const category = await TravelItem.findById(categoryId);

    if (!category) {
      throw new Error('해당 카테고리를 찾을 수 없습니다.');
    }

    console.log(`🗑 삭제할 카테고리: ${categoryId}`);

    // ✅ 부모 카테고리가 존재하는 경우, 먼저 subCategories에서 제거
    if (category.parentCategory) {
      await TravelItem.findByIdAndUpdate(category.parentCategory.toString(), {
        $pull: {subCategories: categoryId}
      });
    }

    // ✅ 하위 카테고리가 존재하는 경우, 재귀적으로 삭제
    if (category.subCategories && category.subCategories.length > 0) {
      for (const subCategoryId of category.subCategories) {
        await exports.deleteCategory(subCategoryId.toString()); // 재귀 삭제
      }
    }

    // ✅ 해당 카테고리에 포함된 이미지 삭제 (삭제할 항목을 먼저 조회 후 삭제)
    if (category.images && category.images.length > 0) {
      for (const imagePath of category.images) {
        const fileName = path.basename(imagePath);
        const filePath = path.join(__dirname, '../uploads', fileName);

        console.log(`🗑 이미지 삭제 시도: ${filePath}`);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ 파일 삭제 완료: ${filePath}`);
        } else {
          console.log(`❌ 파일을 찾을 수 없음: ${filePath}`);
        }
      }
    }

    // ✅ 삭제 전에 `parentCategory` 참조를 확인한 후, 삭제 실행
    const parentCategoryId = category.parentCategory; // 미리 저장
    await TravelItem.findByIdAndDelete(categoryId);
    console.log(`✅ 카테고리 삭제 완료: ${categoryId}`);

    // ✅ 부모 카테고리가 있다면 subCategories에서 해당 ID를 삭제
    if (parentCategoryId) {
      await TravelItem.findByIdAndUpdate(parentCategoryId.toString(), {
        $pull: {subCategories: categoryId}
      });
    }

    return {message: '카테고리 삭제 성공'};
  } catch (error) {
    console.error('❌ 카테고리 삭제 중 오류 발생:', error.message);
    return {message: '카테고리 삭제 중 오류 발생: ' + error.message};
  }
};
