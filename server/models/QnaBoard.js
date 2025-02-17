const mongoose = require('mongoose');

const QnaBoardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // 질문 작성자
      required: true
    },
    category: {
      type: String,
      enum: [
        '회원 정보 문의',
        '회원 가입 문의',
        '여행 상품 문의',
        '항공 문의',
        '투어/티켓 문의',
        '숙소 문의',
        '예약 문의',
        '결제 문의',
        '취소/환불 문의',
        '기타 문의'
      ], // 카테고리 종류
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    images: [
      {
        type: String // 업로드된 이미지 경로
      }
    ],
    attachments: [
      {
        type: String // 첨부 파일 (pdf, doc 등 가능)
      }
    ],
    isAnswered: {
      type: Boolean,
      default: false // 관리자가 답변을 남겼는지 여부
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {timestamps: true}
);

module.exports = mongoose.model('qnaBoard', QnaBoardSchema);
