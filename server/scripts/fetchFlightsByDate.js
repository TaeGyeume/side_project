require('dotenv').config({path: require('path').resolve(__dirname, '../.env')});

const axios = require('axios');
const moment = require('moment-timezone');

const {SERVICE_KEY} = process.env;

if (!SERVICE_KEY) {
  console.error('❌ 환경 변수(SERVICE_KEY)가 설정되지 않았습니다.');
  process.exit(1);
}

// ✅ 검색할 출발지와 도착지 설정 (예: 김포 → 부산)
const DEPARTURE_AIRPORT = 'GMP'; // 김포공항
const ARRIVAL_AIRPORT = 'PUS'; // 김해공항

// ✅ 실행 시 날짜 입력 (예: node fetchFlightsByDate.js 20250215)
const inputDate = process.argv[2];
const selectedDate = inputDate || moment().tz('Asia/Seoul').format('YYYYMMDD'); // 입력 없으면 오늘 날짜 사용

if (!/^\d{8}$/.test(selectedDate)) {
  console.error('🚨 날짜 형식 오류: YYYYMMDD 형식으로 입력하세요.');
  process.exit(1);
}

const fetchFlightsByDate = async () => {
  console.log(`🔍 검색 날짜: ${selectedDate}`);
  console.log(`✈️ 검색 기준: ${DEPARTURE_AIRPORT} → ${ARRIVAL_AIRPORT}`);

  const url = `http://openapi.airport.co.kr/service/rest/FlightScheduleList/getDflightScheduleList?serviceKey=${encodeURIComponent(
    SERVICE_KEY
  )}&schDate=${selectedDate}&schDeptCityCode=${DEPARTURE_AIRPORT}&schArrvCityCode=${ARRIVAL_AIRPORT}`;

  try {
    console.log(`🚀 API 요청: ${url}`);
    const response = await axios.get(url, {
      headers: {'User-Agent': 'Mozilla/5.0'}
    });

    const flights = response.data?.response?.body?.items?.item;

    if (!flights) {
      console.log('🚫 해당 날짜에 운항하는 항공편이 없습니다.');
      return;
    }

    console.log('✅ 운항하는 항공편 목록:');
    const flightList = Array.isArray(flights) ? flights : [flights];

    flightList.forEach(flight => {
      console.log(
        `✈ ${flight.airlineKorean || '알 수 없음'} ${flight.domesticNum || 'N/A'} | ` +
          `출발: ${flight.domesticStartTime} | 도착: ${flight.domesticArrivalTime}`
      );
    });
  } catch (error) {
    console.error('🚨 API 요청 오류:', error.message);
  }
};

fetchFlightsByDate();
