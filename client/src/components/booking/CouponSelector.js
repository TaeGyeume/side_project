// src/components/CouponSelector.js
import React, {useState, useEffect} from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';

const CouponSelector = ({userCoupons, itemPrice, count, onCouponSelect}) => {
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (selectedCoupon) {
      const selected = userCoupons.find(c => c._id === selectedCoupon);
      setDiscountAmount(calculateDiscount(selected));
    }
  }, [selectedCoupon, count]);

  const calculateDiscount = coupon => {
    if (!coupon) return 0;

    let discount = 0;
    const originalPrice = itemPrice * count;

    if (coupon.coupon.discountType === 'percentage') {
      discount = (originalPrice * coupon.coupon.discountValue) / 100;

      if (coupon.coupon.maxDiscountAmount > 0) {
        discount = Math.min(discount, coupon.coupon.maxDiscountAmount);
      }
    } else if (coupon.coupon.discountType === 'fixed') {
      discount = coupon.coupon.discountValue || 0;
    }

    return discount;
  };

  const handleCouponChange = event => {
    const selectedId = event.target.value;
    setSelectedCoupon(selectedId);

    const selected = userCoupons.find(c => c._id === selectedId);
    const discount = calculateDiscount(selected);
    setDiscountAmount(discount);

    onCouponSelect(selected, discount);
  };

  return (
    <Card
      sx={{
        p: 1.5, // 전체 패딩 최소화
        borderRadius: 2,
        boxShadow: 2,
        backgroundColor: '#fff',
        maxWidth: '100%',
        mx: 'auto'
      }}>
      <CardContent sx={{p: 1.5}}>
        {' '}
        {/* 내부 여백 줄이기 */}
        <Typography variant="h6" fontWeight="bold" sx={{mb: 1}}>
          🎫 쿠폰 선택
        </Typography>
        {/* 한 줄로 정렬된 쿠폰 선택 영역 */}
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl fullWidth variant="outlined" sx={{minWidth: '200px'}}>
            <InputLabel>쿠폰 선택</InputLabel>
            <Select
              value={selectedCoupon}
              onChange={handleCouponChange}
              label="쿠폰 선택">
              <MenuItem value="">쿠폰 선택 안함</MenuItem>
              {userCoupons.map(coupon => (
                <MenuItem key={coupon._id} value={coupon._id}>
                  {coupon.coupon.discountValue
                    ? `${coupon.coupon.name} (${coupon.coupon.discountValue}${
                        coupon.coupon.discountType === 'percentage' ? '%' : '원'
                      } 할인)`
                    : '(할인 정보 없음)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        {/* 할인 금액 표시 (아래쪽 중앙 정렬 & 크기 축소) */}
        <Box sx={{textAlign: 'none', p: 1.2, mt: 1}}>
          <Chip
            label={`할인 금액: ${discountAmount.toLocaleString()} 원`}
            color="primary"
            sx={{fontSize: '14px', fontWeight: 'bold', p: 0.8}} // 칩 크기 줄이기
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default CouponSelector;
