// MongoDB 연결 파일

const mongoose = require('mongoose');
require('dotenv').config(); // .env 파일 로드

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // 애플리케이션 종료
  }
};

module.exports = connectDB;
