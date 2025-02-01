const Flight = require('../models/Flight');

// ✈️ 모든 항공편 조회
// const getFlights = async (req, res) => {
//   try {
//     const flights = await Flight.find();
//     res.json(flights);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// ✈️ 항공편 검색 API
const getFlights = async (req, res) => {
  try {
    const {departure, arrival, date, returnDate} = req.query;
    let query = [];

    if (departure && arrival && date) {
      query.push({
        $or: [{'departure.city': departure}, {'departure.airport': departure}],
        $or: [{'arrival.city': arrival}, {'arrival.airport': arrival}],
        'departure.time': {
          $gte: new Date(date),
          $lte: new Date(date + 'T23:59:59Z')
        }
      });
    }

    if (returnDate) {
      query.push({
        $or: [{'departure.city': arrival}, {'departure.airport': arrival}],
        $or: [{'arrival.city': departure}, {'arrival.airport': departure}],
        'departure.time': {
          $gte: new Date(returnDate),
          $lte: new Date(returnDate + 'T23:59:59Z')
        }
      });
    }

    const flights = await Flight.find({$or: query});
    res.json(flights);
  } catch (error) {
    res.status(500).json({message: '항공편 검색 중 오류 발생', error});
  }
};

// ✈️ 특정 항공편 조회
const getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({message: 'Flight not found'});
    res.json(flight);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

module.exports = {getFlights, getFlightById};
