import React, {useEffect, useState} from 'react';
import {fetchCoupons, deleteCoupon} from '../../../api/coupon/couponService';
import {
  Card,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Stack,
  Alert,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PercentIcon from '@mui/icons-material/Percent';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getCoupons = async () => {
      try {
        const data = await fetchCoupons();
        setCoupons(data);
      } catch (err) {
        setError(err.message || '쿠폰을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    getCoupons();
  }, []);

  const handleDelete = async couponId => {
    const confirmDelete = window.confirm('정말로 이 쿠폰을 삭제하시겠습니까?');

    if (confirmDelete) {
      try {
        await deleteCoupon(couponId);
        setCoupons(prev => prev.filter(coupon => coupon._id !== couponId));
        alert('쿠폰이 삭제되었습니다.');
      } catch (error) {
        alert(error.message);
      }
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{maxWidth: 600, mx: 'auto', mt: 3}}>
        {error}
      </Alert>
    );

  return (
    <Box sx={{maxWidth: 1200, mx: 'auto', mt: 4, p: 2}}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        🎫 쿠폰 목록
      </Typography>

      {coupons.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
          {coupons.map(coupon => (
            <Card
              key={coupon._id}
              sx={{
                width: {xs: '100%', sm: '48%', md: '32%'},
                minHeight: 280,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 2,
                borderRadius: 3,
                boxShadow: 4,
                backgroundColor:
                  coupon.discountType === 'percentage' ? '#e3f2fd' : '#e8f5e9', // 할인 유형별 배경색
                transition: 'transform 0.2s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: 6
                }
              }}>
              {/* 카드 헤더 (이름 & 할인 타입) */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  {coupon.name}
                </Typography>
                <Chip
                  label={
                    coupon.discountType === 'percentage' ? '퍼센트 할인' : '정액 할인'
                  }
                  color={coupon.discountType === 'percentage' ? 'primary' : 'success'}
                  sx={{fontWeight: 'bold'}}
                />
              </Stack>

              {/* 할인 정보 아이콘과 함께 표시 */}
              <Box sx={{flexGrow: 1, mt: 2}}>
                <Stack direction="row" spacing={1} alignItems="center">
                  {coupon.discountType === 'percentage' ? (
                    <PercentIcon color="primary" />
                  ) : (
                    <MonetizationOnIcon color="success" />
                  )}
                  <Typography variant="h5" fontWeight="bold" color="text.primary">
                    {coupon.discountValue}
                    {coupon.discountType === 'percentage' ? '%' : '원'} 할인
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" mt={1}>
                  {coupon.description}
                </Typography>

                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                  <Typography variant="body2">
                    최대 할인:{' '}
                    <strong>
                      {coupon.maxDiscountAmount > 0
                        ? `${coupon.maxDiscountAmount}원`
                        : '없음'}
                    </strong>
                  </Typography>
                  <Typography variant="body2">
                    최소 구매 금액: <strong>{coupon.minPurchaseAmount}원</strong>
                  </Typography>
                  <Typography variant="body2">
                    적용 대상: <strong>{coupon.applicableMemberships.join(', ')}</strong>
                  </Typography>
                  <Typography variant="body2" color="error">
                    만료일: <strong>{new Date(coupon.expiresAt).toLocaleString()}</strong>
                  </Typography>
                </Box>
              </Box>

              {/* 삭제 버튼 위치 개선 */}
              <Stack direction="row" justifyContent="flex-end" mt={2}>
                <IconButton color="error" onClick={() => handleDelete(coupon._id)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" mt={2} textAlign="center">
          등록된 쿠폰이 없습니다.
        </Typography>
      )}
    </Box>
  );
};

export default CouponList;
