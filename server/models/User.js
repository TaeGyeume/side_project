const mongoose = require('mongoose');

// 사용자 스키마 정의
const UserSchema = new mongoose.Schema(
  {
    userid: {
      type: String, // 로그인 시 사용할 사용자 아이디
      required: true,
      unique: true
    },
    email: {
      type: String, // 비밀번호 찾기, 알림 수신용 이메일
      required: true,
      unique: true
    },
    phone: {
      type: String, // 핸드폰 번호
      required: true,
      unique: true
    },
    password: {
      type: String, // 비밀번호 (해시 처리 예정)
      required: true
    },
    profileImage: {
      type: String, // 프로필 이미지 URL
      default: ''
    },
    address: {
      type: String, // 주소
      default: ''
    },
    username: {
      type: String, // 실제 사용자 이름 (예: 장동건, 유재석)
      default: ''
    },
    provider: {
      type: String, // 가입 유형 (local, facebook, google, naver, kakao)
      enum: ['local', 'facebook', 'google', 'naver', 'kakao'],
      default: 'local'
    },
    socialId: {
      type: String, // 소셜 로그인 ID (Facebook, Google, Naver, Kakao)
      default: null
    },
    membershipLevel: {
      type: String, // 회원 등급
      enum: ['길초보', '길잡이', '모험왕'],
      default: '길초보'
    },
    roles: {
      type: [String], // 사용자 역할 (admin, user)
      enum: ['user', 'admin'],
      default: ['user']
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId, // 즐겨찾기 항목
        ref: 'Product' // 참조할 컬렉션 (예: 여행 상품)
      }
    ],
    passwordResetToken: {
      type: String // 비밀번호 초기화 토큰 (이메일 발송 시 사용)
    },
    passwordResetExpires: {
      type: Date // 토큰 만료 시간
    }
  },
  {timestamps: true}
); // 자동으로 createdAt, updatedAt 필드 추가

module.exports = mongoose.model('User', UserSchema);
