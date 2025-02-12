import React, {useState, useEffect} from 'react';
import {fetchAllTravelItems} from '../../../api/travelItem/travelItemService';
import TravelItemCard from './TravelItemCard';

const TravelItemList = ({limit = null}) => {
  // ✅ limit 추가 (기본값: null)
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ 모든 최하위 상품 불러오기
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await fetchAllTravelItems();
        setItems(data);
      } catch (error) {
        console.error('❌ 상품 리스트 불러오기 실패:', error);
        setError('상품 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="container mt-4">
      <h2>🛍️ 여행용품 리스트</h2>

      {/* ✅ 로딩 상태 표시 */}
      {loading && <p>⏳ 상품 데이터를 불러오는 중...</p>}

      {/* ✅ 오류 발생 시 메시지 표시 */}
      {error && <p className="text-danger">{error}</p>}

      {/* ✅ 상품 목록 표시 (최대 limit 개수) */}
      {!loading && !error && (
        <div className="row">
          {items.length > 0 ? (
            items
              .slice(0, limit || items.length) // ✅ 최대 `limit` 개수만 표시
              .map(item => (
                <div key={item._id} className="col-md-4 mb-4">
                  <TravelItemCard travelItem={item} />
                </div>
              ))
          ) : (
            <p>등록된 상품이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TravelItemList;
