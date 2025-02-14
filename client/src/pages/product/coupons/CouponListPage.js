import React from 'react';
import {useNavigate} from 'react-router-dom';
import CouponList from '../../../components/product/coupons/CouponList';
import {Button} from 'react-bootstrap';

const CouponListPage = () => {
  const navigate = useNavigate();
  return (
    <div className="coupon-list-page">
      <h1>쿠폰 관리</h1>
      {/* ✅ 쿠폰 생성 페이지로 이동하는 버튼 */}
      <Button variant="primary" onClick={() => navigate('/product/coupon/new')}>
        ➕ 새 쿠폰 만들기
      </Button>
      <CouponList />
    </div>
  );
};

export default CouponListPage;
