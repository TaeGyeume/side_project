require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

console.log("🔍 현재 환경 변수 값:");
console.log("SERVICE_KEY:", process.env.SERVICE_KEY ? "✅ 설정됨" : "❌ 없음");
console.log("서비스 키 값:", process.env.SERVICE_KEY);  // 실제 값 확인

const mongoose = require('mongoose');
const axios = require('axios');
const Flight = require('../models/Flight');

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
    const queryParams = `?serviceKey=${encodeURIComponent(SERVICE_KEY)}`
        + `&schDate=20240201`
        + `&schDeptCityCode=GMP`
        + `&schArrvCityCode=PUS`
        + `&schAirLine=AB`
        + `&schFlightNum=1`;

    try {
        console.log("🔄 항공편 데이터를 가져오는 중...");
        const response = await axios.get(url + queryParams);

        console.log("📜 API 응답 데이터:", JSON.stringify(response.data, null, 2));

        if (response.data?.response?.header?.resultCode !== "00") {
            console.error("❌ API 요청 실패:", response.data.response.header.resultMsg);
            return;
        }

        const items = response.data?.response?.body?.items?.item;

        if (!items) {
            console.error("❌ 'items' 속성이 없습니다. 데이터가 없을 수 있습니다.");
            return;
        }

        const flights = Array.isArray(items) ? items : [items];

        const flightDocs = flights.map(flight => ({
            airline: flight.airline,
            flightNumber: flight.flightId,
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
            price: Math.floor(Math.random() * (500000 - 100000) + 100000),
            seatsAvailable: Math.floor(Math.random() * 200)
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
