import React, {useState} from 'react';
import CouponForm from '../../../components/product/coupons/CouponForm';
import {createCoupon} from '../../../api/coupon/couponService';

const CreateCouponPage = () => {
  const [message, setMessage] = useState('');

  const handleCouponSubmit = async couponData => {
    try {
      const response = await createCoupon(couponData);
      setMessage(response.message);
    } catch (error) {
      setMessage(error.error || '쿠폰 생성 중 오류 발생');
    }
  };

  return (
    <div className="create-coupon-page">
      <h2>쿠폰 생성</h2>
      {message && <p className="alert">{message}</p>}
      <CouponForm onSubmit={handleCouponSubmit} />
    </div>
  );
};

export default CreateCouponPage;
