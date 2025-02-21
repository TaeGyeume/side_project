import React, {useState, useEffect} from 'react';
import {fetchAllTravelItems} from '../../../api/travelItem/travelItemService';
import TravelItemCard from './TravelItemCard';
import {Box, Typography, CircularProgress} from '@mui/material';

const TravelItemList = ({limit = null}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await fetchAllTravelItems();
        setItems(data);
      } catch (error) {
        console.error('상품 리스트 불러오기 실패:', error);
        setError('상품 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <Box sx={{maxWidth: 1000, mx: 'auto', mt: 4, px: 2}}>
      <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
        🛍️ 여행용품 리스트
      </Typography>

      {/* 로딩 상태 표시 */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      )}

      {/* 오류 발생 시 메시지 표시 */}
      {error && (
        <Typography variant="body1" color="error" textAlign="center">
          {error}
        </Typography>
      )}

      {/* 상품 목록 (한 줄에 3개씩) */}
      {!loading && !error && (
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          gap={3} // 카드 간 간격 조정
          mt={3}>
          {items.length > 0 ? (
            items
              .slice(0, limit || items.length) // 최대 `limit` 개수만 표시
              .map(item => (
                <Box key={item._id} sx={{width: '31%'}}>
                  {' '}
                  {/* 한 줄에 3개씩 */}
                  <TravelItemCard travelItem={item} />
                </Box>
              ))
          ) : (
            <Typography variant="body1" textAlign="center">
              등록된 상품이 없습니다.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TravelItemList;
