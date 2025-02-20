// src/pages/accommodation/AccommodationDetail.js
import React, {useState, useEffect} from 'react';
import {useParams, useSearchParams} from 'react-router-dom';
import {fetchAccommodationDetail} from '../../api/accommodation/accommodationService';
import RoomCard from '../../components/accommodations/RoomCard';
import MapComponent from '../../components/accommodations/GoogleMapComponent';
import Slider from 'react-slick'; // ✅ React Slick 추가
import Modal from 'react-modal';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReviewList from '../../components/review/ReviewList';

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
  const [modalIsOpen, setModalIsOpen] = useState(false); // ✅ 모달 상태
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // ✅ 선택한 이미지 인덱스

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

  // ✅ 이미지 클릭 시 모달 열기
  const openModal = index => {
    setSelectedImageIndex(index);
    setModalIsOpen(true);
  };

  // ✅ 모달을 닫을 때 상태 변경 확인
  const closeModal = () => {
    setModalIsOpen(false);
    console.log(`📌 모달이 닫혔습니다.`);
  };

  // ✅ 다음 이미지 보기
  const nextImage = () => {
    setSelectedImageIndex(prevIndex => (prevIndex + 1) % accommodation.images.length);
  };

  // ✅ 이전 이미지 보기
  const prevImage = () => {
    setSelectedImageIndex(
      prevIndex =>
        (prevIndex - 1 + accommodation.images.length) % accommodation.images.length
    );
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
    arrows: true,
    beforeChange: (current, next) => {
      document.querySelectorAll('.slick-slide').forEach(slide => {
        if (slide.getAttribute('aria-hidden') === 'true') {
          slide.setAttribute('tabindex', '-1'); // 포커스 방지
        } else {
          slide.removeAttribute('tabindex'); // 활성화된 슬라이드는 tabindex 제거
        }
      });
    }
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
              <div
                key={index}
                className="carousel-slide"
                onClick={e => {
                  if (e.currentTarget.getAttribute('aria-hidden') !== 'true') {
                    openModal(index);
                  }
                }}
                style={{cursor: 'pointer'}}>
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
          <div
            className="single-image"
            onClick={() => openModal(0)}
            style={{cursor: 'pointer'}}>
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

      {/* ✅ 모달 (Lightbox) */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="이미지 확대 보기"
        shouldCloseOnOverlayClick={true} // 배경 클릭 시 닫힘
        shouldCloseOnEsc={true}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)', // 어두운 배경
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1300
          },
          content: {
            position: 'relative',
            border: 'none',
            background: 'transparent',
            overflow: 'hidden',
            padding: '0',
            width: 'auto',
            height: 'auto',
            inset: 'unset',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300
          }
        }}>
        {/* 이전 버튼 */}
        <button
          onClick={prevImage}
          style={{
            position: 'absolute',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            border: 'none',
            padding: '10px 15px',
            cursor: 'pointer',
            fontSize: '20px',
            borderRadius: '50%',
            transition: 'background 0.3s'
          }}
          onMouseEnter={e => (e.target.style.background = 'rgba(0, 0, 0, 0.8)')}
          onMouseLeave={e => (e.target.style.background = 'rgba(0, 0, 0, 0.5)')}>
          ⬅
        </button>

        {/* 이미지 */}
        <img
          src={`${SERVER_URL}${accommodation.images[selectedImageIndex]}`}
          alt="확대 이미지"
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
          }}
        />

        {/* 다음 버튼 */}
        <button
          onClick={nextImage}
          style={{
            position: 'absolute',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            border: 'none',
            padding: '10px 15px',
            cursor: 'pointer',
            fontSize: '20px',
            borderRadius: '50%',
            transition: 'background 0.3s'
          }}
          onMouseEnter={e => (e.target.style.background = 'rgba(0, 0, 0, 0.8)')}
          onMouseLeave={e => (e.target.style.background = 'rgba(0, 0, 0, 0.5)')}>
          ➡
        </button>
      </Modal>

      <h3>예약 가능한 객실</h3>
      {availableRooms?.length > 0 ? (
        availableRooms.map(room => (
          <div key={room._id} style={{marginBottom: '20px'}}>
            <RoomCard room={room} />
          </div>
        ))
      ) : (
        <p>예약 가능한 객실이 없습니다.</p>
      )}

      {/* 리뷰 리스트 */}
      <h2>📝 리뷰</h2>
      <ReviewList productId={accommodationId} />
    </div>
  );
};

export default AccommodationDetail;
