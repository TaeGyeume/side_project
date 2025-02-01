const TourTicket = require('../models/TourTicket');
const fs = require('fs');
const path = require('path');

// 모든 투어.티켓 조회
exports.getAllTickets = async () => {
  return await TourTicket.find();
};

// 특정 투어.티켓 조회
exports.getTicketById = async id => {
  return await TourTicket.findById(id);
};

exports.createTicket = async ticketData => {
  try {
    const ticket = new TourTicket(ticketData);
    return await ticket.save();
  } catch (error) {
    throw new Error(`상품 등록 오류: ${error.message}`);
  }
};

exports.updateTourTicket = async (
  ticketId,
  {title, price, stock, deleteImages, newImages}
) => {
  try {
    let ticket = await TourTicket.findById(ticketId);
    if (!ticket) {
      throw new Error('상품을 찾을 수 없습니다.');
    }

    // ✅ 기존 이미지 삭제 처리
    if (deleteImages && Array.isArray(deleteImages)) {
      deleteImages.forEach(imagePath => {
        const fullPath = path.join(
          __dirname,
          '..',
          imagePath.replace('/uploads/', 'uploads/')
        );
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath); // 파일 삭제
        }
      });

      // DB에서도 삭제된 이미지 제거
      ticket.images = ticket.images.filter(img => !deleteImages.includes(img));
    }

    // ✅ 새로운 이미지 추가
    if (newImages && newImages.length > 0) {
      const newImagePaths = newImages.map(file => `/uploads/${file.filename}`);
      ticket.images = [...ticket.images, ...newImagePaths]; // 기존 이미지 + 추가된 이미지 유지
    }

    // ✅ 상품 정보 업데이트
    ticket.title = title || ticket.title;
    ticket.price = price || ticket.price;
    ticket.stock = stock || ticket.stock;

    await ticket.save();
    return ticket;
  } catch (error) {
    throw new Error(error.message || '상품 수정 중 오류 발생');
  }
};

// 투어.티켓 삭제
exports.deleteTicket = async id => {
  return await TourTicket.findByIdAndDelete(id);
};
