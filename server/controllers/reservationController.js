const Reservation = require('../models/Reservation');
const Flight = require('../models/Flight');

// 🎫 예약 생성
const createReservation = async (req, res) => {
  try {
    const {flightId, passengers} = req.body;
    const flight = await Flight.findById(flightId);

    if (!flight) return res.status(404).json({message: 'Flight not found'});

    const totalPrice = flight.price * passengers.length;

    const reservation = await Reservation.create({
      user: req.user.id, // authMiddleware에서 설정됨
      flight: flightId,
      passengers,
      totalPrice
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// 🎫 사용자의 예약 목록 조회
const getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({user: req.user.id}).populate('flight');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

module.exports = {createReservation, getUserReservations};
