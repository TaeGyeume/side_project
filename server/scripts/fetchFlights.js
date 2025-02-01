require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');
const Flight = require('../models/Flight'); // Flight 모델 가져오기

// ✅ 환경 변수 설정
const { DB_URI, SERVICE_KEY } = process.env;

if (!DB_URI || !SERVICE_KEY) {
    console.error("❌ 환경 변수(DB_URI 또는 SERVICE_KEY)가 설정되지 않았습니다.");
    process.exit(1);
}

// ✅ MongoDB 연결
mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB 연결 성공"))
  .catch(err => console.error("❌ MongoDB 연결 실패:", err));

// ✅ OpenAPI에서 운항 정보 가져오기 및 DB 저장
const fetchFlights = async () => {
    const url = 'http://openapi.airport.co.kr/service/rest/FlightScheduleList/getDflightScheduleList';
    const queryParams = `?serviceKey=${SERVICE_KEY}`
        + `&schDate=20240201`  // 검색 날짜 (예제)
        + `&schDeptCityCode=GMP`  // 출발지 (김포)
        + `&schArrvCityCode=PUS`  // 도착지 (부산)
        + `&schAirLine=AB`
        + `&schFlightNum=1`;

    try {
        console.log("🔄 항공편 데이터를 가져오는 중...");
        const response = await axios.get(url + queryParams);
        const data = response.data.response.body.items.item;

        if (!data) {
            console.error("❌ 가져온 항공편 데이터가 없습니다.");
            return;
        }

        const flights = Array.isArray(data) ? data : [data];

        // ✅ 가져온 데이터를 `Flight` 스키마에 맞게 변환하여 저장
        const flightDocs = flights.map(flight => ({
            airline: flight.airline, // 항공사
            flightNumber: flight.flightId, // 항공편 번호
            departure: {
                airport: flight.depAirport,
                city: flight.depAirportNm,
                time: new Date(flight.depPlandTime)
            },
            arrival: {
                airport: flight.arrAirport,
                city: flight.arrAirportNm,
                time: new Date(flight.arrPlandTime)
            },
            price: Math.floor(Math.random() * (500000 - 100000) + 100000), // 랜덤 가격 (10만 ~ 50만)
            seatsAvailable: Math.floor(Math.random() * 200) // 랜덤 좌석 (최대 200석)
        }));

        await Flight.insertMany(flightDocs);
        console.log("✅ 운항 스케줄이 성공적으로 저장되었습니다.");
    } catch (error) {
        console.error("❌ OpenAPI 호출 중 오류 발생:", error.message);
    } finally {
        mongoose.connection.close();
    }
};

// ✅ 실행
fetchFlights();
