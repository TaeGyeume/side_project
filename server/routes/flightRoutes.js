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
  try {
    const {departure, arrival, date} = req.query;

    if (!departure || !arrival || !date) {
      return res.status(400).json({error: '출발지, 도착지, 날짜를 입력해주세요.'});
    }

    // ✅ 사용자가 입력한 날짜 → 요일 변환
    const selectedWeekday = moment(date).locale('ko').format('dddd');
    const searchDate = moment(date).startOf('day');

    console.log(
      `🔍 검색 조건 - 출발: ${departure}, 도착: ${arrival}, 날짜: ${date}(${selectedWeekday})`
    );

    // ✅ MongoDB에서 검색 (출발지, 도착지, 운항 요일 필터링)
    const flights = await Flight.find({
      'departure.airport': departure,
      'arrival.airport': arrival,
      operatingDays: selectedWeekday
    });

    // ✅ 운항 요일과 출발-도착 날짜를 **따로** 필터링
    const filteredFlights = flights.filter(flight => {
      const departureDate = moment(flight.departure.time).startOf('day'); // 출발 날짜
      const arrivalDate = moment(flight.arrival.time).startOf('day'); // 도착 날짜

      // 🚀 1️⃣ 운항 요일 필터링 (검색 날짜의 요일이 `operatingDays`에 포함되어야 함)
      const matchesWeekday = flight.operatingDays.includes(selectedWeekday);

      // 🚀 2️⃣ 출발-도착 날짜 필터링 (검색 날짜가 출발-도착 기간 내에 있어야 함)
      const withinDateRange =
        searchDate.isSameOrAfter(departureDate) && searchDate.isSameOrBefore(arrivalDate);

      return matchesWeekday && withinDateRange; // ✅ 두 조건을 따로 검사한 후 결과 반환
    });

    console.log(`🔍 필터링된 결과:`, filteredFlights);

    if (filteredFlights.length === 0) {
      return res.status(404).json({
        message: `🚫 선택한 날짜(${date})(${selectedWeekday})에 운항하는 항공편이 없습니다.`
      });
    }

    res.json(filteredFlights);
  } catch (error) {
    console.error('🚨 항공편 검색 오류:', error);
    res.status(500).json({error: '서버 오류 발생'});
  }
});

module.exports = router;
