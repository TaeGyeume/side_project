import React, {useState, useEffect} from 'react';
import {useParams, useSearchParams, useNavigate} from 'react-router-dom';
import {getRoomById} from '../../api/room/roomService';
import RoomImageGallery from '../../components/accommodations/RoomImageGallery';

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

  // 예약하기 버튼 클릭 시 이동
  const handleBooking = () => {
    navigate(
      `/accommodation/booking/${roomId}?startDate=${startDate}&endDate=${endDate}&adults=${adults}`
    );
  };

  return (
    <div className="container mt-4">
      {/* 객실 이미지 갤러리 */}
      <RoomImageGallery imageUrls={imageUrls} />

      {/* 객실 정보 카드 */}
      <div className="card mt-4 p-4">
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
    </div>
  );
};

export default RoomDetail;
