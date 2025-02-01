// src/pages/accommodation/AccommodationDetail.js
import React, {useState, useEffect} from 'react';
import {useParams, useSearchParams} from 'react-router-dom';
import axios from '../../api/axios';
import RoomCard from '../../components/accommodations/RoomCard';

// ✅ 기본 날짜 설정 함수 (오늘 + n일)
const getFormattedDate = (daysToAdd = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};

const AccommodationDetail = () => {
  const {accommodationId} = useParams();
  const [searchParams] = useSearchParams();
  const [accommodationData, setAccommodationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ `searchParams`에서 검색 조건 가져오되, 값이 없으면 기본값 사용
  const startDate = searchParams.get('startDate') || getFormattedDate(1); // 기본값: 내일
  const endDate = searchParams.get('endDate') || getFormattedDate(2); // 기본값: 모레
  const adults = searchParams.get('adults') || 1;
  const minPrice = searchParams.get('minPrice') || 0;
  const maxPrice = searchParams.get('maxPrice') || 500000;

  useEffect(() => {
    const fetchAccommodationDetail = async () => {
      try {
        const params = {startDate, endDate, adults, minPrice, maxPrice};
        console.log('🔍 숙소 상세 요청 params:', params);

        const response = await axios.get(`/accommodations/${accommodationId}/rooms`, {
          params
        });

        setAccommodationData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('❌ 숙소 상세 정보 오류:', err);
        setError('숙소 정보를 불러오는 중 오류 발생');
        setLoading(false);
      }
    };

    fetchAccommodationDetail();
  }, [accommodationId, startDate, endDate, adults, minPrice, maxPrice]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!accommodationData) return <div>데이터가 없습니다.</div>;

  const {accommodation, availableRooms} = accommodationData;

  return (
    <div className="container mt-3">
      <h2>{accommodation.name}</h2>
      <p>{accommodation.description}</p>
      <p>
        <strong>주소:</strong> {accommodation.address}
      </p>
      {accommodation.images?.length > 0 && (
        <div className="mb-3">
          {accommodation.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${accommodation.name} 이미지 ${index + 1}`}
              style={{maxWidth: '300px', marginRight: '10px'}}
            />
          ))}
        </div>
      )}

      <h3>예약 가능한 객실</h3>
      {availableRooms?.length > 0 ? (
        availableRooms.map(room => <RoomCard key={room._id} room={room} />)
      ) : (
        <p>예약 가능한 객실이 없습니다.</p>
      )}
    </div>
  );
};

export default AccommodationDetail;
