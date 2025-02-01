const TourTicket = require('../models/TourTicket');

// 모든 투어.티켓 조회
exports.getAllTickets = async () => {
  return await TourTicket.find();
};

// 특정 투어.티켓 조회
exports.getTicketById = async id => {
  return await TourTicket.findById(id);
};

// 새 투어.티켓 생성
// exports.createTicket = async ticketData => {
//   const ticket = new TourTicket(ticketData);
//   return await ticket.save();
// };

exports.createTicket = async ticketData => {
  try {
    const ticket = new TourTicket(ticketData);
    return await ticket.save();
  } catch (error) {
    throw new Error(`상품 등록 오류: ${error.message}`);
  }
};

// 기존 투어.티켓 수정
exports.updateTicket = async (id, updateData) => {
  return await TourTicket.findByIdAndUpdate(
    id,
    {...updateData, updatedAt: new Date(Date.now() + 9 * 60 * 60 * 1000)}, // 한국 시간대
    {new: true}
  );
};

// 투어.티켓 삭제
exports.deleteTicket = async id => {
  return await TourTicket.findByIdAndDelete(id);
};
