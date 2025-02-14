const mongoose = require('mongoose');

const tourTicketSchema = new mongoose.Schema(
  {
    title: {type: String, required: true}, // 상품명
    description: {type: String}, // 상품 설명
    location: {type: String, required: true}, // 위치
    price: {type: Number, required: true}, // 가격
    stock: {type: Number, required: true}, // 재고
    images: [{type: String}], // 이미지
    views: {type: Number, default: 0},
    createdAt: {
      type: Date,
      default: () => new Date(Date.now() + 9 * 60 * 60 * 1000) // KST
    },
    updatedAt: {
      type: Date,
      default: () => new Date(Date.now() + 9 * 60 * 60 * 1000) // KST
    }
  },

  {timestamps: false}
);

const TourTicket = mongoose.model('tourTicket', tourTicketSchema);

module.exports = TourTicket;
