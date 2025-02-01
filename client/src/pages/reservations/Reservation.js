import React, {useState} from 'react';
import {createReservation} from '../../api/flights';

const Reservation = ({flightId}) => {
  const [passengers, setPassengers] = useState([{name: '', age: '', passportNumber: ''}]);

  const handleReservation = async () => {
    const response = await createReservation(flightId, passengers);
    if (response) {
      alert('예약 완료!');
    }
  };

  return (
    <div>
      <h2>예약하기</h2>
      <button onClick={handleReservation}>예약 확정</button>
    </div>
  );
};

export default Reservation;
