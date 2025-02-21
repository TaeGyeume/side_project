// src/components/MyCoupons.js
import React, {useEffect, useState} from 'react';
import {fetchUserCoupons} from '../../api/coupon/couponService';
import {Card, Typography, Box, Stack, Chip, CircularProgress} from '@mui/material';

const MyCoupons = ({userId}) => {
  const [unusedCoupons, setUnusedCoupons] = useState([]);
  const [usedCoupons, setUsedCoupons] = useState([]);
  const [expiredCoupons, setExpiredCoupons] = useState([]); // 만료된 쿠폰 추가
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getUserCoupons = async () => {
      try {
        const data = await fetchUserCoupons(userId);

        // 쿠폰 상태별로 필터링
        setUnusedCoupons(data.filter(coupon => !coupon.isUsed && !coupon.isExpired));
        setUsedCoupons(data.filter(coupon => coupon.isUsed));
        setExpiredCoupons(data.filter(coupon => coupon.isExpired)); // 만료된 쿠폰 추가
      } catch (err) {
        setError(err.message || '쿠폰을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) getUserCoupons();
  }, [userId]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" align="center" mt={3}>
        {error}
      </Typography>
    );

  return (
    <Box sx={{maxWidth: '900px', mx: 'auto', mt: 4, p: 2}}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        🎫 내 쿠폰함
      </Typography>

      {/* 사용 가능한 쿠폰 섹션 */}
      <Box sx={{mt: 3}}>
        <Typography variant="h6" fontWeight="bold">
          사용 가능한 쿠폰
        </Typography>

        {unusedCoupons.length > 0 ? (
          <Stack spacing={2} mt={2}>
            {unusedCoupons.map(({_id, coupon, issuedAt, expiresAt}) => (
              <Card
                key={_id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  backgroundColor: '#fff'
                }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {coupon.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {coupon.description}
                </Typography>
                <Box sx={{mt: 1}}>
                  <Typography variant="body2">
                    할인 금액:{' '}
                    <strong>
                      {coupon.discountValue}
                      {coupon.discountType === 'percentage' ? '%' : '원'}
                    </strong>
                  </Typography>
                  <Typography variant="body2">
                    최소 구매 금액: {coupon.minPurchaseAmount}원
                  </Typography>
                  <Typography variant="body2">
                    발급일: {new Date(issuedAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    만료일: {new Date(expiresAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" mt={2}>
            사용 가능한 쿠폰이 없습니다.
          </Typography>
        )}
      </Box>

      {/* 사용된 쿠폰 섹션 */}
      <Box sx={{mt: 5}}>
        <Typography variant="h6" fontWeight="bold">
          ⚠ 사용된 쿠폰
        </Typography>

        {usedCoupons.length > 0 ? (
          <Stack spacing={2} mt={2}>
            {usedCoupons.map(({_id, coupon, issuedAt, expiresAt}) => (
              <Card
                key={_id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  backgroundColor: '#f5f5f5'
                }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {coupon.name}
                  </Typography>
                  <Chip
                    label="⚠ 사용됨"
                    color="secondary"
                    size="small"
                    sx={{fontSize: '12px', fontWeight: 'bold'}}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {coupon.description}
                </Typography>
                <Box sx={{mt: 1}}>
                  <Typography variant="body2">
                    할인 금액:{' '}
                    <strong>
                      {coupon.discountValue}
                      {coupon.discountType === 'percentage' ? '%' : '원'}
                    </strong>
                  </Typography>
                  <Typography variant="body2">
                    최소 구매 금액: {coupon.minPurchaseAmount}원
                  </Typography>
                  <Typography variant="body2">
                    발급일: {new Date(issuedAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    만료일: {new Date(expiresAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" mt={2}>
            사용한 쿠폰이 없습니다.
          </Typography>
        )}
      </Box>

      {/* 만료된 쿠폰 섹션 */}
      <Box sx={{mt: 5}}>
        <Typography variant="h6" fontWeight="bold" color="error">
          ⏳ 만료된 쿠폰
        </Typography>

        {expiredCoupons.length > 0 ? (
          <Stack spacing={2} mt={2}>
            {expiredCoupons.map(({_id, coupon, issuedAt, expiresAt}) => (
              <Card
                key={_id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  backgroundColor: '#ffebee' // 연한 빨간색으로 만료 쿠폰 표시
                }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" fontWeight="bold" color="error">
                    {coupon.name}
                  </Typography>
                  <Chip
                    label="⏳ 만료됨"
                    color="error"
                    size="small"
                    sx={{fontSize: '12px', fontWeight: 'bold'}}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {coupon.description}
                </Typography>
                <Box sx={{mt: 1}}>
                  <Typography variant="body2">
                    할인 금액:{' '}
                    <strong>
                      {coupon.discountValue}
                      {coupon.discountType === 'percentage' ? '%' : '원'}
                    </strong>
                  </Typography>
                  <Typography variant="body2">
                    최소 구매 금액: {coupon.minPurchaseAmount}원
                  </Typography>
                  <Typography variant="body2">
                    발급일: {new Date(issuedAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="error">
                    만료일: {new Date(expiresAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" mt={2}>
            만료된 쿠폰이 없습니다.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MyCoupons;
