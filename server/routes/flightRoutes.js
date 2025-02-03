const express = require('express');
const router = express.Router();
const {getFlights, getFlightById} = require('../controllers/flightController');

const transformFlightData = (flight) => {
  const departureTime = new Date(flight.departure.time);
  const arrivalTime = new Date(flight.arrival.time);

  return {
      ...flight._doc,
      airlineLogo: `https://yourcdn.com/logos/${flight.airline.replace(/\s/g, "").toLowerCase()}.png`,
      flightDuration: calculateDuration(departureTime, arrivalTime),
      seatClass: "할인석",
      isDiscounted: Math.random() < 0.5,
  };
};

// ✅ 비행 시간 계산 함수
const calculateDuration = (departureTime, arrivalTime) => {
  const diffMs = Math.abs(arrivalTime - departureTime);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours}시간 ${minutes}분`;
};

// ✅ 변환된 데이터를 제공하는 API
router.get('/flights', async (req, res) => {
  try {
      const flights = await Flight.find();
      const transformedFlights = flights.map(transformFlightData);
      res.json(transformedFlights);
  } catch (error) {
      res.status(500).json({ message: "서버 오류", error: error.message });
  }
});


// // ✅ 모든 항공편 조회 API
// router.get('/flights', async (req, res) => {
//   try {
//       const flights = await Flight.find();
//       res.json(flights);
//   } catch (error) {
//       res.status(500).json({ message: "서버 오류", error: error.message });
//   }
// });

// ✈️ 모든 항공편 조회
router.get('/', getFlights);

// ✈️ 특정 항공편 조회 (ID 기준)
router.get('/:id', getFlightById);

module.exports = router;
