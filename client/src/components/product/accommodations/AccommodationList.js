import React, {useState, useEffect} from 'react';
import {fetchAccommodations} from '../../../api/accommodation/accommodationService';
import AccommodationCard from './AccommodationCard';

const AccommodationList = ({limit = null}) => {
  // limit을 props로 받음 (기본값: null)
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 모든 숙소 불러오기
  useEffect(() => {
    const loadAccommodations = async () => {
      try {
        const data = await fetchAccommodations();
        setAccommodations(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadAccommodations();
  }, []);

  // 삭제 시 숙소 리스트에서 제거
  const handleAccommodationDeleted = deletedId => {
    setAccommodations(prevAccommodations =>
      prevAccommodations.filter(accommodation => accommodation._id !== deletedId)
    );
  };

  return (
    <div className="container mt-4">
      <h2>🏨 숙소 리스트</h2>

      {/* 로딩 상태 표시 */}
      {loading && <p>⏳ 숙소 데이터를 불러오는 중...</p>}

      {/* 오류 발생 시 메시지 표시 */}
      {error && <p className="text-danger">{error}</p>}

      {/* 숙소 목록 표시 (최대 3개) */}
      {!loading && !error && (
        <div className="row">
          {accommodations.length > 0 ? (
            accommodations
              .slice(0, limit || accommodations.length) // 최대 `limit`개의 숙소만 표시
              .map(accommodation => (
                <div key={accommodation._id} className="col-md-4 mb-4">
                  <AccommodationCard
                    accommodation={accommodation}
                    onAccommodationDeleted={handleAccommodationDeleted}
                  />
                </div>
              ))
          ) : (
            <p>등록된 숙소가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AccommodationList;
