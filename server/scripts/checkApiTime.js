require('dotenv').config({path: require('path').resolve(__dirname, '../.env')});

const axios = require('axios');
const moment = require('moment-timezone');

const {SERVICE_KEY} = process.env;

if (!SERVICE_KEY) {
  console.error('❌ 환경 변수(SERVICE_KEY)가 설정되지 않았습니다.');
  process.exit(1);
}

// ✅ 테스트할 공항 코드 (예: 김포 → 부산)
const DEPARTURE_AIRPORT = 'GMP'; // 출발 공항 (김포공항)
const ARRIVAL_AIRPORT = 'PUS'; // 도착 공항 (김해공항)

const checkApiTime = async () => {
  const todayKST = moment().tz('Asia/Seoul').format('YYYYMMDD'); // KST 기준 날짜
  const todayUTC = moment().utc().format('YYYYMMDD'); // UTC 기준 날짜

  console.log(`🔍 KST 날짜: ${todayKST}, UTC 날짜: ${todayUTC}`);

  const urls = {
    KST: `http://openapi.airport.co.kr/service/rest/FlightScheduleList/getDflightScheduleList?serviceKey=${encodeURIComponent(
      SERVICE_KEY
    )}&schDate=${todayKST}&schDeptCityCode=${DEPARTURE_AIRPORT}&schArrvCityCode=${ARRIVAL_AIRPORT}`,

    UTC: `http://openapi.airport.co.kr/service/rest/FlightScheduleList/getDflightScheduleList?serviceKey=${encodeURIComponent(
      SERVICE_KEY
    )}&schDate=${todayUTC}&schDeptCityCode=${DEPARTURE_AIRPORT}&schArrvCityCode=${ARRIVAL_AIRPORT}`
  };

  try {
    console.log(`🚀 KST 기준 요청: ${urls.KST}`);
    const responseKST = await axios.get(urls.KST, {
      headers: {'User-Agent': 'Mozilla/5.0'}
    });

    console.log(`🚀 UTC 기준 요청: ${urls.UTC}`);
    const responseUTC = await axios.get(urls.UTC, {
      headers: {'User-Agent': 'Mozilla/5.0'}
    });

    console.log(
      '✅ KST 응답 데이터:',
      responseKST.data?.response?.body?.items?.item || '없음'
    );
    console.log(
      '✅ UTC 응답 데이터:',
      responseUTC.data?.response?.body?.items?.item || '없음'
    );
  } catch (error) {
    console.error('🚨 API 요청 오류:', error.message);
  }
};

checkApiTime();
