const mongoose = require('mongoose');
const tourTicketService = require('../services/tourTicketService');

// 모든 투어.티켓 조회
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await tourTicketService.getAllTickets();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({message: '서버 오류', error});
  }
};

// 특정 투어.티켓 상세 조회
exports.getTicketById = async (req, res) => {
  const {id} = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({message: '유효하지 않은 ID 형식입니다.'});
    }

    const ticket = await tourTicketService.getTicketById(id);
    if (ticket) {
      res.json(ticket);
    } else {
      res.status(404).json({message: '상품을 찾을 수 없습니다.'});
    }
  } catch (error) {
    res.status(500).json({message: '서버 오류', error});
  }
};

// 새 투어.티켓 생성
exports.createTicket = async (req, res) => {
  const {title, description, location, price, stock, images} = req.body;

  try {
    const newTicket = await tourTicketService.createTicket({
      title,
      description,
      location,
      price,
      stock,
      images
    });
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(400).json({message: '유효하지 않은 요청 데이터', error});
  }
};

// 기존 투어.티켓 수정
exports.updateTicket = async (req, res) => {
  const {id} = req.params;
  const {title, description, location, price, stock, images} = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({message: '유효하지 않은 ID 형식입니다.'});
    }

    const updatedTicket = await tourTicketService.updateTicket(id, {
      title,
      description,
      location,
      price,
      stock,
      images
    });

    if (updatedTicket) {
      res.json(updatedTicket);
    } else {
      res.status(404).json({message: '상품을 찾을 수 없습니다.'});
    }
  } catch (error) {
    res.status(400).json({message: '유효하지 않은 요청 데이터', error});
  }
};

// 투어.티켓 삭제
exports.deleteTicket = async (req, res) => {
  const {id} = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({message: '유효하지 않은 ID 형식입니다.'});
    }

    const deletedTicket = await tourTicketService.deleteTicket(id);
    if (deletedTicket) {
      res.status(204).send();
    } else {
      res.status(404).json({message: '상품을 찾을 수 없습니다.'});
    }
  } catch (error) {
    res.status(500).json({message: '서버 오류', error});
  }
};
