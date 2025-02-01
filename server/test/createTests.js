require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// 데이터 추가 함수
const addTestData = async () => {
  try {
    // MongoDB 기본 데이터베이스 가져오기
    const db = mongoose.connection.db;
    const collection = db.collection('test');

    // 데이터 추가
    const result = await collection.insertOne({
      name: 'Test User',
      age: 30,
      email: 'testuser@example.com',
      createdAt: new Date()
    });

    console.log('Data added to "test" collection:', result.ops);
  } catch (error) {
    console.error('Error adding data to "test" collection:', error.message);
  }
};

// 컬렉션 생성 함수
const createTestCollection = async () => {
  try {
    // MongoDB 기본 데이터베이스 가져오기
    const db = mongoose.connection.db;

    // 컬렉션 목록 확인
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'test');

    if (collectionExists) {
      console.log('Collection "test" already exists.');
    } else {
      // 컬렉션 생성
      await db.dropCollection('test');
      console.log('Collection "test" created successfully.');
    }

    // 데이터 추가
    await addTestData();
  } catch (error) {
    console.error('Error creating collection:', error.message);
  } finally {
    // 연결 종료
    mongoose.connection.close();
  }
};

// 실행 함수
const run = async () => {
  try {
    await connectDB();
    await createTestCollection();
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

// 루트 폴더에서 실행 시 => node server/test/createTests.js
// server 폴더에서 실행 시 => node test/createTests.js
run();
