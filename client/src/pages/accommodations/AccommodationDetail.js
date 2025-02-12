// src/pages/accommodation/AccommodationDetail.js
import React, {useState, useEffect} from 'react';
import {useParams, useSearchParams} from 'react-router-dom';
import {fetchAccommodationDetail} from '../../api/accommodation/accommodationService';
import RoomCard from '../../components/accommodations/RoomCard';
import MapComponent from '../../components/accommodations/GoogleMapComponent';
import Slider from 'react-slick'; // ✅ React Slick 추가
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// ✅ 기본 날짜 설정 함수 (오늘 + n일)
const getFormattedDate = (daysToAdd = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};

const AccommodationDetail = () => {
  const {accommodationId} = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [accommodationData, setAccommodationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ `searchParams`에서 검색 조건 가져오되, 값이 없으면 기본값 사용
  const [startDate, setStartDate] = useState(
    new Date(searchParams.get('startDate') || getFormattedDate(1))
  );
  const [endDate, setEndDate] = useState(
    new Date(searchParams.get('endDate') || getFormattedDate(2))
  );
  const [adults, setAdults] = useState(Number(searchParams.get('adults')) || 1);
  const minPrice = searchParams.get('minPrice') || 0;
  const maxPrice = searchParams.get('maxPrice') || 500000;

  useEffect(() => {
    const loadAccommodationDetail = async () => {
      try {
        const params = {startDate, endDate, adults, minPrice, maxPrice};
        console.log('🔍 숙소 상세 요청 params:', params);

        const data = await fetchAccommodationDetail(accommodationId, params);
        setAccommodationData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAccommodationDetail();
  }, [accommodationId, startDate, endDate, adults, minPrice, maxPrice]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!accommodationData) return <div>데이터가 없습니다.</div>;

  const {accommodation, availableRooms} = accommodationData;
  const SERVER_URL = 'http://localhost:5000';

  // ✅ 검색 조건 변경 시 URL 업데이트 및 다시 검색
  const handleSearchUpdate = () => {
    const newParams = {
      startDate: startDate.toISOString().split('T')[0], // ✅ 직접 변환
      endDate: endDate.toISOString().split('T')[0], // ✅ 직접 변환
      adults,
      minPrice,
      maxPrice
    };

    setSearchParams(newParams); // ✅ URL 업데이트
  };

  // ✅ React Slick 설정
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true
  };

  console.log('Accommodation Coordinates:', accommodation.coordinates);

  return (
    <div className="container mt-3">
      <h2>{accommodation.name}</h2>
      <p>{accommodation.description}</p>
      <p>
        <strong>주소:</strong> {accommodation.address}
      </p>
      {/* ✅ Google Maps 컴포넌트 추가 */}
      {accommodation.coordinates && accommodation.coordinates.coordinates ? (
        <MapComponent
          lat={accommodation.coordinates.coordinates[1]} // 배열 두 번째 값 (위도)
          lng={accommodation.coordinates.coordinates[0]} // 배열 첫 번째 값 (경도)
        />
      ) : (
        <p>지도 정보를 불러올 수 없습니다.</p>
      )}

      {/* ✅ 숙소 편의시설 추가 */}
      <div className="mt-4">
        <h3>🏡 숙소 편의시설</h3>
        {accommodation.amenities && accommodation.amenities.length > 0 ? (
          <ul className="list-group">
            {accommodation.amenities.map((amenity, index) => (
              <li key={index} className="list-group-item">
                ✅ {amenity}
              </li>
            ))}
          </ul>
        ) : (
          <p>등록된 편의시설이 없습니다.</p>
        )}
      </div>

      {/* ✅ 날짜 및 인원 변경 기능 */}
      <div className="search-filters">
        <label>체크인</label>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          dateFormat="yyyy-MM-dd"
        />

        <label>체크아웃</label>
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          dateFormat="yyyy-MM-dd"
        />

        <label>인원</label>
        <input
          type="number"
          min="1"
          value={adults}
          onChange={e => setAdults(e.target.value)}
        />

        <button className="btn btn-primary" onClick={handleSearchUpdate}>
          다시 검색
        </button>
      </div>

      {/* ✅ 이미지가 2개 이상이면 Slick 캐러셀 적용 */}
      {accommodation.images?.length > 1 ? (
        <Slider {...settings} className="mb-3">
          {accommodation.images.map((img, index) => {
            let imageUrl = img;

            // 이미지 경로가 `/uploads/...` 형식이면 절대 경로로 변환
            if (imageUrl.startsWith('/uploads/')) {
              imageUrl = `${SERVER_URL}${imageUrl}`;
            }

            return (
              <div key={index} className="carousel-slide">
                <img
                  src={imageUrl}
                  alt={`${accommodation.name} 이미지 ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </div>
            );
          })}
        </Slider>
      ) : (
        // ✅ 이미지가 1개일 경우 그냥 단일 이미지 표시
        accommodation.images?.length === 1 && (
          <div className="single-image">
            <img
              src={
                accommodation.images[0].startsWith('/uploads/')
                  ? `${SERVER_URL}${accommodation.images[0]}`
                  : accommodation.images[0]
              }
              alt={`${accommodation.name} 이미지`}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
          </div>
        )
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
