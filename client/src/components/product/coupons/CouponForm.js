import React, {useState} from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Typography
} from '@mui/material';

const CouponForm = ({onSubmit}) => {
  const [coupon, setCoupon] = useState({
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscountAmount: '',
    minPurchaseAmount: 0,
    applicableMemberships: [],
    expiresAt: ''
  });

  const membershipOptions = ['길초보', '길잡이', '모험왕'];

  const handleChange = e => {
    const {name, value} = e.target;
    setCoupon(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMembershipChange = membership => {
    setCoupon(prev => ({
      ...prev,
      applicableMemberships: prev.applicableMemberships.includes(membership)
        ? prev.applicableMemberships.filter(m => m !== membership)
        : [...prev.applicableMemberships, membership]
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(coupon);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 500,
        mx: 'auto',
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
        bgcolor: 'white'
      }}>
      <Typography variant="h5" sx={{mb: 2}}>
        쿠폰 생성
      </Typography>

      <TextField
        fullWidth
        label="쿠폰 이름"
        name="name"
        value={coupon.name}
        onChange={handleChange}
        required
        sx={{mb: 2}}
      />

      <TextField
        fullWidth
        label="쿠폰 설명"
        name="description"
        value={coupon.description}
        onChange={handleChange}
        multiline
        rows={3}
        sx={{mb: 2}}
      />

      <FormControl fullWidth sx={{mb: 2}} variant="outlined">
        <InputLabel id="discount-type-label" shrink>
          할인 유형
        </InputLabel>
        <Select
          labelId="discount-type-label"
          name="discountType"
          value={coupon.discountType}
          onChange={handleChange}
          label="할인 유형" // 추가: Select 요소에 라벨을 직접 적용
        >
          <MenuItem value="percentage">퍼센트 할인</MenuItem>
          <MenuItem value="fixed">정액 할인</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="할인 값"
        type="number"
        name="discountValue"
        value={coupon.discountValue}
        onChange={handleChange}
        required
        sx={{mb: 2}}
      />

      {coupon.discountType === 'percentage' && (
        <TextField
          fullWidth
          label="최대 할인 금액"
          type="number"
          name="maxDiscountAmount"
          value={coupon.maxDiscountAmount}
          onChange={handleChange}
          sx={{mb: 2}}
        />
      )}

      <TextField
        fullWidth
        label="최소 구매 금액"
        type="number"
        name="minPurchaseAmount"
        value={coupon.minPurchaseAmount}
        onChange={handleChange}
        sx={{mb: 2}}
      />

      <FormControl component="fieldset" sx={{mb: 2}}>
        <Typography variant="body1">적용 대상 멤버십</Typography>
        <FormGroup>
          {membershipOptions.map(membership => (
            <FormControlLabel
              key={membership}
              control={
                <Checkbox
                  checked={coupon.applicableMemberships.includes(membership)}
                  onChange={() => handleMembershipChange(membership)}
                />
              }
              label={membership}
            />
          ))}
        </FormGroup>
      </FormControl>

      <TextField
        fullWidth
        label="쿠폰 만료일"
        type="datetime-local"
        name="expiresAt"
        value={coupon.expiresAt}
        onChange={handleChange}
        required
        InputLabelProps={{shrink: true}} // 추가: 라벨이 겹치지 않도록 함
        sx={{mb: 3}}
      />

      <Button type="submit" variant="contained" color="primary" fullWidth>
        쿠폰 생성
      </Button>
    </Box>
  );
};

export default CouponForm;
