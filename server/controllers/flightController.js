const Flight = require('../models/Flight');
const moment = require('moment-timezone');

// ✈️ 모든 항공편 조회 컨트롤러
exports.getFlights = async (req, res) => {
  try {
    const flights = await Flight.find();
    res.status(200).json(flights);
  } catch (error) {
    console.error('🚨 항공편 조회 오류:', error.message);
    res.status(500).json({message: '서버 오류 발생'});
  }
};

// ✈️ 편도 항공편 검색 컨트롤러 (UTC 변환 적용)
exports.searchFlights = async (req, res) => {
  try {
    const {departure, arrival, date, passengers} = req.query;

    if (!departure || !arrival || !date || !passengers) {
      return res
        .status(400)
        .json({error: '출발지, 도착지, 날짜, 인원수를 입력해주세요.'});
    }

    const parsedPassengers = parseInt(passengers, 10);
    if (isNaN(parsedPassengers) || parsedPassengers <= 0) {
      return res.status(400).json({error: '인원수는 1명 이상이어야 합니다.'});
    }

    const searchDateStart = moment
      .tz(date, 'YYYY-MM-DD', 'Asia/Seoul')
      .startOf('day')
      .utc()
      .toDate();
    const searchDateEnd = moment
      .tz(date, 'YYYY-MM-DD', 'Asia/Seoul')
      .endOf('day')
      .utc()
      .toDate();
    const selectedWeekday = moment(date, 'YYYY-MM-DD').locale('ko').format('dddd');

    console.log(
      `🔍 변환된 검색 시간 범위 (UTC 기준): ${searchDateStart} ~ ${searchDateEnd}`
    );
    console.log(`🔍 요일 필터: ${selectedWeekday}`);

    const flights = await Flight.find({
      'departure.airport': departure,
      'arrival.airport': arrival,
      'departure.date': {$gte: searchDateStart, $lte: searchDateEnd},
      operatingDays: {$in: [selectedWeekday]},
      seatsAvailable: {$gte: parsedPassengers}
    });

    console.log(`🔍 검색 결과 개수: ${flights.length}`);

    if (flights.length === 0) {
      return res.status(404).json({
        message: `🚫 선택한 날짜(${date})(${selectedWeekday})에 ${parsedPassengers}명 좌석이 있는 항공편이 없습니다.`
      });
    }

    res.status(200).json(flights);
  } catch (error) {
    console.error('🚨 항공편 검색 오류:', error.message);
    res.status(500).json({error: '서버 오류 발생'});
  }
};
