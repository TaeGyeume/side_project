const multer = require('multer');
const path = require('path');

// ✅ 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/qna'); // 업로드 폴더 설정
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // 파일명 설정
  }
});

// ✅ 파일 필터 설정 (이미지 & 문서만 허용)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('지원되지 않는 파일 형식입니다.'), false);
  }
};

const upload = multer({storage, fileFilter});

module.exports = upload;
