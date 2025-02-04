const express = require('express');
const Flight = require('../models/Flight');
const moment = require('moment-timezone'); // ✅ 추가
const router = express.Router();

// ✅ 모든 항공편 가져오기 API (GET /api/flights)
router.get('/', async (req, res) => {
  // 여기 '/'가 중요!
  try {
    const flights = await Flight.find(); // 모든 항공편 조회
    res.json(flights);
  } catch (error) {
    console.error('❌ 항공편 데이터를 가져오는 데 실패했습니다:', error);
    res.status(500).json({message: '서버 오류'});
  }
});

// ✈️ 항공편 검색 API
router.get('/search', async (req, res) => {
  const { departure, arrival, date } = req.query;
  console.log('🌐 서버에서 받은 요청:', { departure, arrival, date });

  if (!departure || !arrival || !date) {
    console.warn('⚠️ 필수 파라미터 누락');
    return res.status(400).json({ error: '출발지, 도착지, 날짜가 필요합니다.' });
  }

  try {
    // ✅ 사용자가 검색한 날짜의 요일 계산
    const searchWeekday = moment(date, 'YYYY-MM-DD').format('dddd');

    const flights = await Flight.find({
      'departure.airport': departure,
      'arrival.airport': arrival,
      'operatingDays': searchWeekday // ✅ 해당 요일에 운항하는 항공편만 검색
    });

    console.log('✅ 검색된 항공편:', flights.length);
    res.json(flights);
  } catch (error) {
    console.error('❌ 검색 오류:', error);
    res.status(500).json({ error: '검색 중 오류 발생' });
  }
});

module.exports = router;