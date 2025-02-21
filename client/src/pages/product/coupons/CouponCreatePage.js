import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom'; // 페이지 이동을 위한 useNavigate 추가
import CouponForm from '../../../components/product/coupons/CouponForm';
import {createCoupon} from '../../../api/coupon/couponService';

const CreateCouponPage = () => {
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이션 훅

  const handleCouponSubmit = async couponData => {
    try {
      await createCoupon(couponData);
      alert('쿠폰이 성공적으로 생성되었습니다!'); // 알림 표시
      navigate('/product/coupon/list'); // 쿠폰 리스트 페이지로 이동
    } catch (error) {
      console.error('쿠폰 생성 실패:', error);
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
