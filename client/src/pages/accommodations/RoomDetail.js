// src/pages/accommodation/RoomDetail.js
import React, {useState, useEffect} from 'react';
import {useParams, useSearchParams, useNavigate} from 'react-router-dom';
import {getRoomById} from '../../api/room/roomService';
import Slider from 'react-slick'; // React Slick 추가
import Modal from 'react-modal';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const RoomDetail = () => {
  const {roomId} = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const adults = searchParams.get('adults') || 1;

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const loadRoomDetail = async () => {
      try {
        const room = await getRoomById(roomId);
        setRoomData(room);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRoomDetail();
  }, [roomId]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!roomData) return <div>객실 정보를 찾을 수 없습니다.</div>;

  const SERVER_URL = 'http://localhost:5000';
  const imageUrls =
    roomData.images?.length > 0
      ? roomData.images.map(img =>
          img.startsWith('/uploads/') ? `${SERVER_URL}${img}` : img
        )
      : ['/default-image.jpg'];

  // 모달 열기
  const openModal = index => {
    setSelectedImageIndex(index);
    setModalIsOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setModalIsOpen(false);
  };

  // 이전 이미지 보기
  const prevImage = () => {
    setSelectedImageIndex(
      prevIndex => (prevIndex - 1 + imageUrls.length) % imageUrls.length
    );
  };

  // 다음 이미지 보기
  const nextImage = () => {
    setSelectedImageIndex(prevIndex => (prevIndex + 1) % imageUrls.length);
  };

  // 예약하기 버튼 클릭 시 이동
  const handleBooking = () => {
    navigate(
      `/accommodation/booking/${roomId}?startDate=${startDate}&endDate=${endDate}&adults=${adults}`
    );
  };

  // React Slick 슬라이드 설정
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true
  };

  return (
    <div className="container mt-4">
      {/* 객실 이미지 (슬라이드 적용) */}
      <div className="text-center">
        {imageUrls.length > 1 ? (
          <Slider {...sliderSettings}>
            {imageUrls.map((img, index) => (
              <div
                key={index}
                onClick={() => openModal(index)}
                style={{cursor: 'pointer'}}>
                <img
                  src={img}
                  className="img-fluid"
                  alt={`${roomData.name} 이미지 ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '450px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </div>
            ))}
          </Slider>
        ) : (
          <img
            src={imageUrls[0]}
            className="img-fluid"
            alt={roomData.name}
            onClick={() => openModal(0)}
            style={{
              width: '100%',
              height: '450px',
              objectFit: 'cover',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          />
        )}
      </div>

      {/* 객실 정보 카드 */}
      <div className="card mt-4 p-4">
        {/* 날짜 및 인원 정보 */}
        <div className="d-flex justify-content-between border-bottom pb-3">
          <div>
            <p>
              <strong>체크인:</strong> {startDate}
            </p>
            <p>
              <strong>체크아웃:</strong> {endDate}
            </p>
          </div>
          <div>
            <p>
              <strong>인원:</strong> {adults}명
            </p>
          </div>
        </div>

        {/* 객실 상세 정보 */}
        <div className="mt-3">
          <h3 className="mb-3">{roomData.name}</h3>
          {roomData.description && (
            <p style={{fontSize: '1.1rem', color: '#555'}}>{roomData.description}</p>
          )}

          <p>
            <strong>최대 수용 인원:</strong> {roomData.maxGuests}명
          </p>

          {roomData.amenities?.length > 0 && (
            <p>
              <strong>편의시설:</strong> {roomData.amenities.join(', ')}
            </p>
          )}

          {/* 가격 및 예약 버튼 */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <h4>
              💰 <strong>{roomData.pricePerNight.toLocaleString()}원</strong>/1박
            </h4>
            <button className="btn btn-primary btn-lg" onClick={handleBooking}>
              🏨 예약하기
            </button>
          </div>
        </div>
      </div>

      {/* 이미지 모달 (Lightbox) */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="이미지 확대 보기"
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
        <button onClick={prevImage} className="btn btn-dark position-absolute start-0">
          ⬅
        </button>

        {/* 이미지 */}
        <img
          src={imageUrls[selectedImageIndex]}
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
        <button onClick={nextImage} className="btn btn-dark position-absolute end-0">
          ➡
        </button>
      </Modal>
    </div>
  );
};

export default RoomDetail;
